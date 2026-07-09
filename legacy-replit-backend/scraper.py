from replit.object_storage import Client
import requests
import time
from tqdm import tqdm  # for progress bar
import cv2
import numpy as np
import datetime
import json
from dotenv import load_dotenv
import os
import pandas as pd
from bs4 import BeautifulSoup
from openai import OpenAI
from sqlalchemy import create_engine, Column, Integer, Text, Date, JSON, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import psycopg2

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def parse_about_artwork(link):
    response = requests.get(link)
    soup = BeautifulSoup(response.text, 'html.parser')
    about = soup.find('div', class_='artwork__intro__desc js-artwork__intro__desc artwork__intro__desc--cropped') or \
            soup.find('div', class_='artwork__intro__desc js-artwork__intro__desc')
    if about:
        for br in about.find_all('br'):
            br.unwrap()
        paragraphs = about.find_all('p')
        return ' '.join(p.text.strip() for p in paragraphs)
    return ""

# Load environment variables
load_dotenv()

# Initialize clients
client = Client()
openai_client = OpenAI()

# Database setup
Base = declarative_base()

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True)
    image_url = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    description = Column(JSON, nullable=False)
    created_at = Column(Date, server_default=text('now()'), nullable=False)

# Get database connection
database_url = os.environ.get('DATABASE_URL')
# Remove asyncpg and ensure we're using a synchronous driver
if 'postgresql+asyncpg' in database_url:
    database_url = database_url.replace('postgresql+asyncpg', 'postgresql')
if '?sslmode=require' not in database_url and 'postgresql' in database_url:
    database_url += '?sslmode=require'

# Create engine and session
engine = create_engine(database_url)
Session = sessionmaker(bind=engine)

# Create tables if they don't exist
Base.metadata.create_all(engine)

# Load and prepare dataset
df = pd.read_csv("openaccess/MetMuseum_paintings_expanded.csv")
df = df[df['Is Public Domain']]
df = df.reset_index(drop=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Get today's date for sequential dating
start_date = datetime.date.today()
successful_uploads = 0

# Add this retry decorator function before your main loop
@retry(
    retry=retry_if_exception_type((SQLAlchemyError, psycopg2.OperationalError)),
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    reraise=True
)
def commit_with_retry(session, new_image):
    session.add(new_image)
    session.commit()
    return True

# Iterate through the dataframe
for index, row in tqdm(df.iterrows(), total=len(df)):
    image_url = row['primaryImage']
    
    # Strip trailing dot from image URL if present
    if isinstance(image_url, str) and image_url.endswith('.'):
        image_url = image_url.rstrip('.')
        
    if pd.isna(row['Artist Display Name']) or pd.isna(row['Title']):
        continue
    
    # Skip if URL is empty
    if not isinstance(image_url, str) or not image_url.strip():
        continue
        
    # Skip if date is missing or NaN
    if pd.isna(row['Object Date']) or not str(row['Object Date']).strip():
        continue
        
    try:
        # Download image
        response = requests.get(image_url)
        if response.status_code == 200:
            # Convert response content to numpy array
            image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if img is None:  # Check if image was properly decoded
                logging.warning(f"Failed to decode image {index}")
                continue
                
            # Get dimensions
            height, width = img.shape[:2]
            total_pixels = width * height
            aspect_ratio = width / height
            
            # Skip if aspect ratio is too far from 3:2 (1.5)
            # This will skip vertical images (ratio < 1) and very wide images
            if aspect_ratio < 1.1 or aspect_ratio > 2.0 or total_pixels < 3000000:
                continue

            try:
                openai_response = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "I am uploading a photo of a painting. You are an expert in evaluating paintings for visual art meditation. Your task is to analyze an input image and determine whether it is suitable for meditation purposes based on the following three core criteria:\n\n### Evaluation Criteria:\n1. Sense of Calm (0-40 points)  \n   - The painting should evoke peace, stillness, and tranquility.  \n   - Energetic, chaotic, or highly emotional scenes should be avoided.  \n   - Natural landscapes, soft lighting, and harmonious compositions are preferred.  \n\n2. Intricate Details for Exploration (0-30 points)  \n   - The image should have enough complexity for the viewer to explore during meditation.  \n   - Subtle textures, layered landscapes, and delicate brushwork are desirable.  \n   - Abstract but structured compositions can work if they invite prolonged engagement.  \n\n3. Cropping & Framing (0-30 points)  \n   - The painting should be rectangular and free from extraneous elements.  \n   - Avoid images with text, modern artifacts, or visible framing distortions.  \n   - The artwork should be self-contained without distracting borders or mounts.  \n\n### Scoring System:\n- Assign a total score from 0 to 100 based on the above categories.\n- If the score is 60 or above, return \"YES\" (the image is suitable).  \n- If the score is below 60, return \"NO\" (the image is not suitable).  \n\n### Format Output in JSON:\n```json\n{\n  \"score\": <integer between 0 and 100>,\n  \"decision\": \"<YES or NO>\",\n  \"reasoning\": \"<brief explanation for the score>\"\n}\n```\n\n### Examples:\n#### Example 1 (Good Painting - YES)\n*Input Image*: A peaceful landscape painting with rolling hills, soft clouds, and a detailed foreground.  \n*Output*:\n```json\n{\n  \"score\": 90,\n  \"decision\": \"YES\",\n  \"reasoning\": \"The painting is tranquil, with a soft natural landscape and intricate cloud details. It is framed properly and has no distractions.\"\n}\n```\n\n#### Example 2 (Bad Painting - NO)\n*Input Image*: A dramatic historical battle scene with soldiers in action and chaotic movement.  \n*Output*:\n```json\n{\n  \"score\": 35,\n  \"decision\": \"NO\",\n  \"reasoning\": \"The scene is highly energetic and filled with tension, making it unsuitable for meditation. The composition is too busy.\"\n}\n```\n\n#### Example 3 (Borderline Painting - NO)\n*Input Image*: A fan-shaped ink painting with a calming atmosphere but mounted on a colored background.  \n*Output*:\n```json\n{\n  \"score\": 55,\n  \"decision\": \"NO\",\n  \"reasoning\": \"The painting is calm and detailed but does not meet the framing requirement due to its irregular fan shape.\"\n}\n```\n\n### Instructions:\n1. Evaluate each image strictly according to the criteria.\n2. Always return a structured JSON response as outlined.\n3. Do not include personal opinions—use the scoring framework objectively."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": image_url,
                                        "detail": "low",
                                    },
                                },
                            ],
                        }
                    ],
                )
            except Exception as api_error:
                logging.warning(f"First OpenAI API attempt failed for image {index}: {str(api_error)}")
                time.sleep(5)  # Wait 5 seconds before retrying
                try:
                    openai_response = openai_client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "I am uploading a photo of a painting. You are an expert in evaluating paintings for visual art meditation. Your task is to analyze an input image and determine whether it is suitable for meditation purposes based on the following three core criteria:\n\n### Evaluation Criteria:\n1. Sense of Calm (0-40 points)  \n   - The painting should evoke peace, stillness, and tranquility.  \n   - Energetic, chaotic, or highly emotional scenes should be avoided.  \n   - Natural landscapes, soft lighting, and harmonious compositions are preferred.  \n\n2. Intricate Details for Exploration (0-30 points)  \n   - The image should have enough complexity for the viewer to explore during meditation.  \n   - Subtle textures, layered landscapes, and delicate brushwork are desirable.  \n   - Abstract but structured compositions can work if they invite prolonged engagement.  \n\n3. Cropping & Framing (0-30 points)  \n   - The painting should be rectangular and free from extraneous elements.  \n   - Avoid images with text, modern artifacts, or visible framing distortions.  \n   - The artwork should be self-contained without distracting borders or mounts.  \n\n### Scoring System:\n- Assign a total score from 0 to 100 based on the above categories.\n- If the score is 60 or above, return \"YES\" (the image is suitable).  \n- If the score is below 60, return \"NO\" (the image is not suitable).  \n\n### Format Output in JSON:\n```json\n{\n  \"score\": <integer between 0 and 100>,\n  \"decision\": \"<YES or NO>\",\n  \"reasoning\": \"<brief explanation for the score>\"\n}\n```\n\n### Examples:\n#### Example 1 (Good Painting - YES)\n*Input Image*: A peaceful landscape painting with rolling hills, soft clouds, and a detailed foreground.  \n*Output*:\n```json\n{\n  \"score\": 90,\n  \"decision\": \"YES\",\n  \"reasoning\": \"The painting is tranquil, with a soft natural landscape and intricate cloud details. It is framed properly and has no distractions.\"\n}\n```\n\n#### Example 2 (Bad Painting - NO)\n*Input Image*: A dramatic historical battle scene with soldiers in action and chaotic movement.  \n*Output*:\n```json\n{\n  \"score\": 35,\n  \"decision\": \"NO\",\n  \"reasoning\": \"The scene is highly energetic and filled with tension, making it unsuitable for meditation. The composition is too busy.\"\n}\n```\n\n#### Example 3 (Borderline Painting - NO)\n*Input Image*: A fan-shaped ink painting with a calming atmosphere but mounted on a colored background.  \n*Output*:\n```json\n{\n  \"score\": 55,\n  \"decision\": \"NO\",\n  \"reasoning\": \"The painting is calm and detailed but does not meet the framing requirement due to its irregular fan shape.\"\n}\n```\n\n### Instructions:\n1. Evaluate each image strictly according to the criteria.\n2. Always return a structured JSON response as outlined.\n3. Do not include personal opinions—use the scoring framework objectively."},
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": image_url,
                                            "detail": "low",
                                        },
                                    },
                                ],
                            }
                        ],
                    )
                except Exception as retry_error:
                    logging.error(f"Second OpenAI API attempt also failed for image {index}: {str(retry_error)}")
                    continue  # Skip this image and move to the next one
            
            json_str = openai_response.choices[0].message.content.split("```json")[1].split("```")[0].strip()
            evaluation_result = json.loads(json_str)
            if evaluation_result["decision"] == "NO":
                continue

            about_artwork = parse_about_artwork(row['Link Resource'])
            # Skip if about section is empty
            about_artwork_is_generated_by_ai = False
            if not about_artwork.strip():
                openai_response = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": f"Can you give me brief 'about it' text about {row['Title']} by {row['Artist Display Name']}?"},
                            ],
                        }
                    ],
                    max_tokens=1000,
                )
                about_artwork = openai_response.choices[0].message.content
                about_artwork_is_generated_by_ai = True
                
            # Generate filename using index
            filename = f"artwork_{index}.jpg"
            storage_path = f"images/{filename}"
            
            # Upload to Replit storage
            client.upload_from_bytes(storage_path, response.content)
                
            # Prepare description dictionary
            description = {
                "artist": str(row['Artist Display Name']),  # Convert to string to handle NaN
                "name": str(row['Title']),
                "date": str(row['Object Date']),
                "width": int(width),
                "height": int(height),
                "dimensions": str(row['Dimensions']),
                "link": str(row['Link Resource']),
                "repository": str(row['Repository']),
                "about": str(about_artwork),
                "about_is_generated_by_ai": about_artwork_is_generated_by_ai
            }
            
            # Calculate date for this image
            image_date = start_date + datetime.timedelta(days=successful_uploads)
            
            try:
                # Create a new session for each insert
                session = Session()
                try:
                    # Create new image record
                    new_image = Image(
                        image_url=storage_path,
                        date=image_date,
                        description=description
                    )
                    # Use the retry function instead of direct commit
                    success = commit_with_retry(session, new_image)
                    if success:
                        successful_uploads += 1
                        logging.info(f"Successfully uploaded image {index} with date {image_date}")
                except SQLAlchemyError as db_err:
                    logging.error(f"Database error for image {index} after retries: {str(db_err)}")
                    session.rollback()
                finally:
                    session.close()
            
                # Add small delay to avoid overwhelming the server
                time.sleep(2)
            
            except Exception as e:
                logging.error(f"Error processing database operation for image {index}: {str(e)}")
                continue
            
    except Exception as e:
        logging.error(f"Error processing image {index}: {str(e)}")

logging.info(f"Script completed. Successfully uploaded {successful_uploads} images.")