# Meditation Audio Files

This directory contains the audio files used for the meditation app.

## Audio Files

- `Ambient Morning.mp3`: Soft, calming ambient melodies for relaxation
- `Summer Rain.mp3`: Gentle rain sounds for meditation and relaxation
- `3 hz tone.mp3`: Binaural beat tone for deep meditation
- `Old Water.mp3`: Flowing water and natural ambience sounds

## Usage

These audio files are in MP3 format and are optimized for web streaming.
Ideally, audio files for meditation should be:

1. 2-5 minutes long (they will loop automatically)
2. Start and end smoothly for seamless looping
3. Compressed to a reasonable quality (128-192kbps)

## Customization

To customize the available tracks:
1. Add or replace MP3 files in this directory
2. Update the `audioTracks` object in `src/contexts/AudioContext.tsx`
3. Update the track options in `src/components/AudioToggle.tsx`

## Attribution

If using free audio files, please include attribution requirements here.

## Notes

The meditation sound feature uses the HTML5 Audio API to play and control these audio files.
Volume is set to 60% by default but can be adjusted in the AudioContext.tsx file. 