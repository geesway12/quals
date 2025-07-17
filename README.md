# QualiData - Field Research Tool

A comprehensive Progressive Web App (PWA) built with Framework7 for qualitative field research data collection. Designed specifically for hypertension research in Ghana's Eastern Region.

## Features

### 🔍 Recruitment Tools
- **Eligibility Checklist**: Automated screening for different stakeholder types
  - Patients (Hypertensive)
  - Clinicians 
  - Herbalists
  - Policy Stakeholders
- **Participant Tracker**: ID generation and enrollment management

### 📝 Data Collection
- **Interview Guides**: Structured guides for different stakeholder types
- **Field Notes**: Multiple templates for reflexive journals and observations
- **Focus Group Support**: Dedicated FGD management tools

### 🎙️ Audio Recording
- **In-App Recording**: High-quality audio capture
- **Audio Log**: Management and playback of recordings
- **Session Management**: Link audio to participants and sessions

### 💾 Data Management
- **Local Storage**: Offline-first data storage
- **Export Options**: JSON and CSV export formats
- **Research Analysis**: Pre-formatted exports for analysis

## Technology Stack

- **Framework7**: Native mobile UI framework
- **Progressive Web App**: Installable, offline-capable
- **Material Design**: Modern, responsive interface
- **Local Storage**: Browser-based data persistence
- **Web Audio API**: Professional audio recording

## Installation

### Option 1: Web Access
1. Open `index.html` in a modern web browser
2. For mobile: Add to home screen for app-like experience

### Option 2: Local Server
```bash
# Simple HTTP server (Python)
python -m http.server 8000

# Or Node.js
npx http-server

# Then navigate to http://localhost:8000/index.html
```

## File Structure

```
├── index.html            # Main app entry point
├── css/
│   └── app.css           # Custom styles
├── js/
│   └── app.js            # App logic and data management
├── pages/                # Framework7 page components
│   ├── screening-tracker.html
│   ├── interview.html
│   ├── focus-group-discussion.html
│   ├── reflexive-journal.html
│   └── guiding-information.html
├── icons/                # PWA icons
├── manifest.json         # PWA manifest
└── service-worker.js     # Offline functionality
```

## Usage Guide

### 1. Participant Screening
1. Navigate to **Eligibility Checklist**
2. Select stakeholder type
3. Fill in location and RA information
4. Complete all eligibility criteria
5. System generates unique participant ID

### 2. Conducting Interviews
1. Use **Interview Guide** for structured interviews
2. Select enrolled participant
3. Choose interview type (Individual/FGD)
4. Follow domain-specific questions
5. Record detailed notes and observations

### 3. Audio Recording
1. Open **Audio Recorder**
2. Select participant and session type
3. Test audio quality
4. Record interview
5. Save with session notes

### 4. Field Documentation
1. Use **Field Notes** for:
   - Reflexive journals
   - Discussion logs
   - Audio recording logs
   - Transcription tracking
2. Select appropriate template
3. Document observations and context

### 5. Data Export
1. **Complete Export**: Full JSON backup
2. **CSV Exports**: Individual data types
3. **Research Exports**: Analysis-ready formats

## Data Structure

### Participants
- Unique ID generation (e.g., PAT_001, CLN_002)
- Eligibility criteria tracking
- Contact information (secure)
- District and facility information

### Interviews
- Linked to participant IDs
- Structured note-taking
- Non-verbal observations
- Context documentation
- Follow-up tracking

### Audio Files
- Participant association
- Session type classification
- Duration and file size tracking
- Playback and export capabilities

### Field Logs
- Multiple template types
- Reflexive documentation
- Technical issue tracking
- Transcription progress

## Research Implementation

### Stakeholder Types

#### Hypertensive Patients
- Age 18+ years
- Clinically diagnosed hypertension (≥6 months)
- Using conventional/herbal treatments
- Smartphone access
- Digital trial participation willingness

#### Clinicians
- Licensed medical professionals in Ghana
- ≥6 months hypertension management experience
- Eastern Region practice location
- Digital platform comfort
- Interview/workshop participation willingness

#### Herbalists
- Traditional/herbal practitioner identity
- ≥6 months hypertension treatment experience
- Eastern Region client base
- Research setting openness
- Co-design participation willingness

#### Policy Stakeholders
- Health policy/regulation roles
- Ghana NCD/digital health sector activity
- Digital health/innovation familiarity
- Stakeholder dialogue participation willingness

### Interview Domains

**Patients**: Diagnosis experience, treatment history, beliefs, integration perspectives, daily challenges

**Clinicians**: Current practice, patient behaviors, integration attitudes, system constraints, digital readiness

**Herbalists**: Treatment methods, client demographics, integration readiness, conventional care beliefs, digital openness

**Caregivers**: Care role, medication support, treatment beliefs, health system experience, integration attitudes

## Security & Privacy

- **Local Storage**: All data stored on device
- **No Cloud Dependency**: Fully offline capable
- **Export Control**: Manual data transfer only
- **Secure Contact Info**: Safe information storage
- **Participant Anonymity**: ID-based system

## Browser Compatibility

- **Chrome/Chromium**: Full support
- **Safari**: iOS/macOS support
- **Firefox**: Core functionality
- **Edge**: Windows support

**Requirements**: Modern browser with ES6+ support, Web Audio API, LocalStorage

## Troubleshooting

### Audio Issues
- Check microphone permissions
- Ensure sufficient storage space
- Test in quiet environment
- Use quality headphones for playback

### Data Problems
- Verify all required fields completed
- Check browser storage settings
- Export data regularly for backup
- Clear cache if issues persist

### Export Issues
- Allow browser downloads
- Check device storage space
- Try different export formats
- Ensure data exists for export type

## Development

### Setup
```bash
# No build process required
# Direct HTML/CSS/JS implementation
# Framework7 loaded via CDN
```

### Customization
- Modify `css/app.css` for styling
- Edit `js/app.js` for functionality
- Update `pages/` for new features
- Extend eligibility criteria as needed

### Adding New Features
1. Create new page in `pages/` directory
2. Add route to `js/app.js`
3. Update navigation in main interface
4. Test offline functionality

## Support

For technical support or research questions:
1. Check the built-in Help & Support section
2. Review troubleshooting guide
3. Contact research team with:
   - Problem description
   - Device/browser information
   - Steps to reproduce issue

## License

Developed for academic research purposes. Please ensure appropriate permissions and ethical approval for data collection activities.

---

**Note**: This tool is designed for research use in Ghana's Eastern Region. Ensure compliance with local regulations, ethical guidelines, and institutional requirements before deployment.

## Retained Pages

1. **Screening and Participant Management** (`screening-tracker.html`)
2. **Individual Interview** (`interview.html`)
3. **Focus Group Discussion** (`focus-group-discussion.html`)
4. **Reflexive Journal** (`reflexive-journal.html`)
5. **Guiding Information** (`guiding-information.html`)

## Deleted Files

The following files were removed as part of the consolidation process:
- `audio-log.html`
- `audio-recorder.html`
- `eligibility-checklist.html`
- `eligibility-clinicians.html`
- `eligibility-patients.html`
- `export-data.html`
- `field-notes.html`
- `help.html`
- `home.html`
- `index-f7.html`
- `interview-guide.html`
- `interview-patients.html`
- `participant-tracker.html`
- `recruitment-tools.html`
- `settings.html`
- `sync.html`
- `tracker-patients.html`
- `unified-eligibility.html`
- `view-records.html`

## Notes

This consolidation ensures a leaner and more efficient application structure, focusing on essential functionalities.
