// QualiData Framework7 App
var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'QualiData',
  // App id
  id: 'com.qualidata.fieldresearch',
  
  // Theme
  theme: 'auto', // Auto-detect iOS, Android or desktop
  
  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  
  // Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  
  // View settings
  view: {
    pushState: true,
    pushStateRoot: undefined,
  },
  
  // Routes
  routes: [
    {
      path: '/',
      url: './index.html',
    },
    {
      path: '/screening-tracker/',
      url: './screening-tracker.html',
    },
    {
      path: '/interview/',
      url: './interview.html',
    },
    {
      path: '/focus-group-discussion/',
      url: './focus-group-discussion.html',
    },
    {
      path: '/reflexive-journal/',
      url: './reflexive-journal.html',
    },
    {
      path: '/guiding-information/',
      url: './guiding-information.html',
    },
  ],
  
  // PWA Settings
  serviceWorker: {
    path: '/service-worker.js',
  },
});

// Initialize main view after app creation
var mainView = app.views.create('.view-main', {
  url: '/'
});

// Data Storage Manager
class DataManager {
  constructor() {
    this.storagePrefix = 'qualidata_';
    this.init();
  }
  
  init() {
    // Initialize storage if not exists
    if (!localStorage.getItem(this.storagePrefix + 'initialized')) {
      localStorage.setItem(this.storagePrefix + 'initialized', 'true');
      localStorage.setItem(this.storagePrefix + 'participants', JSON.stringify([]));
      localStorage.setItem(this.storagePrefix + 'interviews', JSON.stringify([]));
      localStorage.setItem(this.storagePrefix + 'audio_files', JSON.stringify([]));
      localStorage.setItem(this.storagePrefix + 'field_logs', JSON.stringify([]));
      localStorage.setItem(this.storagePrefix + 'screening_logs', JSON.stringify([]));
      localStorage.setItem(this.storagePrefix + 'consent_logs', JSON.stringify([]));
    }
  }
  
  // Participant Management
  saveParticipant(data) {
    const participants = this.getParticipants();
    const id = this.generateParticipantId(data);
    const participant = {
      id: id,
      ...data,
      dateCreated: new Date().toISOString(),
      status: 'active'
    };
    participants.push(participant);
    localStorage.setItem(this.storagePrefix + 'participants', JSON.stringify(participants));
    return participant;
  }
  
  getParticipants() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'participants') || '[]');
  }
  
  generateParticipantId(data) {
    const prefix = this.getParticipantPrefix(data.stakeholderType);
    const participants = this.getParticipants();
    const existingIds = participants
      .filter(p => p.id.startsWith(prefix))
      .map(p => parseInt(p.id.split('_')[1]) || 0);
    const nextNumber = Math.max(0, ...existingIds) + 1;
    return `${prefix}_${nextNumber.toString().padStart(3, '0')}`;
  }
  
  getParticipantPrefix(type) {
    const prefixes = {
      'patients': 'PAT',
      'clinicians': 'CLN', 
      'herbalists': 'HRB',
      'policy-stakeholders': 'POL'
    };
    return prefixes[type] || 'UNK';
  }
  
  // Interview Management
  saveInterview(data) {
    const interviews = this.getInterviews();
    const interview = {
      id: this.generateId('INT'),
      ...data,
      dateCreated: new Date().toISOString()
    };
    interviews.push(interview);
    localStorage.setItem(this.storagePrefix + 'interviews', JSON.stringify(interviews));
    return interview;
  }
  
  getInterviews() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'interviews') || '[]');
  }
  
  // Audio File Management
  saveAudioFile(data) {
    const audioFiles = this.getAudioFiles();
    const audioFile = {
      id: this.generateId('AUD'),
      ...data,
      dateCreated: new Date().toISOString()
    };
    audioFiles.push(audioFile);
    localStorage.setItem(this.storagePrefix + 'audio_files', JSON.stringify(audioFiles));
    return audioFile;
  }
  
  getAudioFiles() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'audio_files') || '[]');
  }
  
  // Field Log Management
  saveFieldLog(data) {
    const fieldLogs = this.getFieldLogs();
    const fieldLog = {
      id: this.generateId('LOG'),
      ...data,
      dateCreated: new Date().toISOString()
    };
    fieldLogs.push(fieldLog);
    localStorage.setItem(this.storagePrefix + 'field_logs', JSON.stringify(fieldLogs));
    return fieldLog;
  }
  
  getFieldLogs() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'field_logs') || '[]');
  }
  
  // Utility Methods
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  exportData(type) {
    const data = {
      participants: this.getParticipants(),
      interviews: this.getInterviews(),
      audioFiles: this.getAudioFiles(),
      fieldLogs: this.getFieldLogs(),
      screeningLogs: this.getScreeningLogs(),
      consentLogs: this.getConsentLogs(),
      analytics: this.getScreeningAnalytics(),
      exportDate: new Date().toISOString()
    };
    
    if (type === 'json') {
      return this.downloadJSON('qualidata_export.json', data);
    } else if (type === 'csv') {
      return this.exportCSV(data);
    }
  }
  
  downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  downloadCSV(filename, rows, headers) {
    const csv = [headers.join(',')]
      .concat(rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  exportCSV(data) {
    // Export participants
    if (data.participants && data.participants.length > 0) {
      const headers = ['id', 'stakeholderType', 'district', 'facility', 'raInitials', 'dateCreated', 'status'];
      this.downloadCSV('participants.csv', data.participants, headers);
    }
    
    // Export interviews
    if (data.interviews && data.interviews.length > 0) {
      const headers = ['id', 'participantId', 'interviewType', 'notes', 'dateCreated'];
      this.downloadCSV('interviews.csv', data.interviews, headers);
    }
    
    // Export field logs
    if (data.fieldLogs && data.fieldLogs.length > 0) {
      const headers = ['id', 'district', 'raInitials', 'observations', 'challenges', 'issues', 'dateCreated'];
      this.downloadCSV('field_logs.csv', data.fieldLogs, headers);
    }
    
    // Export screening logs
    if (data.screeningLogs && data.screeningLogs.length > 0) {
      const headers = ['id', 'stakeholderType', 'location', 'researchAssistant', 'contactMethod', 'status', 'dateCreated'];
      this.downloadCSV('screening_logs.csv', data.screeningLogs, headers);
    }
    
    // Export consent logs
    if (data.consentLogs && data.consentLogs.length > 0) {
      const headers = ['id', 'participantId', 'consentDate', 'consentMethod', 'audioRecorded', 'dataUseAgreed', 'dateCreated'];
      this.downloadCSV('consent_logs.csv', data.consentLogs, headers);
    }
    
    // Export audio files metadata
    if (data.audioFiles && data.audioFiles.length > 0) {
      const headers = ['id', 'fileName', 'participantId', 'sessionType', 'duration', 'fileSize', 'dateCreated'];
      this.downloadCSV('audio_files.csv', data.audioFiles, headers);
    }
  }
  
  // Statistics
  getStats() {
    const analytics = this.getScreeningAnalytics();
    return {
      totalParticipants: this.getParticipants().length,
      totalInterviews: this.getInterviews().length,
      totalAudio: this.getAudioFiles().length,
      totalLogs: this.getFieldLogs().length,
      totalScreenings: this.getScreeningLogs().length,
      totalConsents: this.getConsentLogs().length,
      totalContacts: analytics.contacted,
      eligibleParticipants: analytics.eligible,
      consentedParticipants: analytics.consented,
      enrolledParticipants: this.getParticipants().length,
      totalSessions: this.getInterviews().length + this.getFieldLogs().length,
      conversionRate: analytics.conversionRate,
      eligibilityRate: analytics.eligibilityRate
    };
  }

  // Alias for compatibility
  getStatistics() {
    return this.getStats();
  }

  // Get all participants (alias for compatibility)
  getAllParticipants() {
    return this.getParticipants();
  }

  // Screening Log Management
  logScreeningAttempt(data) {
    const screeningLogs = this.getScreeningLogs();
    const screeningLog = {
      id: this.generateId('SCR'),
      stakeholderType: data.stakeholderType,
      location: data.location,
      researchAssistant: data.researchAssistant,
      contactMethod: data.contactMethod,
      contactDetails: data.contactDetails,
      approachDate: new Date().toISOString(),
      status: 'contacted', // contacted, screened, eligible, ineligible, declined, consented
      eligibilityChecks: [],
      notes: data.notes || '',
      dateCreated: new Date().toISOString()
    };
    screeningLogs.push(screeningLog);
    localStorage.setItem(this.storagePrefix + 'screening_logs', JSON.stringify(screeningLogs));
    return screeningLog;
  }

  updateScreeningStatus(screeningId, status, eligibilityChecks = [], notes = '') {
    const screeningLogs = this.getScreeningLogs();
    const index = screeningLogs.findIndex(log => log.id === screeningId);
    if (index !== -1) {
      screeningLogs[index].status = status;
      screeningLogs[index].eligibilityChecks = eligibilityChecks;
      screeningLogs[index].screeningDate = new Date().toISOString();
      screeningLogs[index].notes = notes;
      localStorage.setItem(this.storagePrefix + 'screening_logs', JSON.stringify(screeningLogs));
      return screeningLogs[index];
    }
    return null;
  }

  getScreeningLogs() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'screening_logs') || '[]');
  }

  // Consent Log Management
  logConsentProcess(data) {
    const consentLogs = this.getConsentLogs();
    const consentLog = {
      id: this.generateId('CON'),
      screeningId: data.screeningId,
      participantId: data.participantId,
      consentDate: new Date().toISOString(),
      consentMethod: data.consentMethod, // verbal, written, digital
      witnessName: data.witnessName || '',
      witnessSignature: data.witnessSignature || '',
      participantSignature: data.participantSignature || '',
      consentFormVersion: data.consentFormVersion || '1.0',
      audioRecorded: data.audioRecorded || false,
      dataUseAgreed: data.dataUseAgreed || false,
      withdrawalExplained: data.withdrawalExplained || false,
      contactForResults: data.contactForResults || false,
      notes: data.notes || '',
      dateCreated: new Date().toISOString()
    };
    consentLogs.push(consentLog);
    localStorage.setItem(this.storagePrefix + 'consent_logs', JSON.stringify(consentLogs));
    return consentLog;
  }

  getConsentLogs() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'consent_logs') || '[]');
  }

  // Enhanced Participant Management with Screening Integration
  saveParticipantFromScreening(screeningId, participantData, consentData) {
    // First, save the participant
    const participant = this.saveParticipant(participantData);
    
    // Update screening log to show participant was enrolled
    this.updateScreeningStatus(screeningId, 'consented', [], 'Participant enrolled and consented');
    
    // Log the consent process
    const consentLog = this.logConsentProcess({
      screeningId: screeningId,
      participantId: participant.id,
      ...consentData
    });
    
    // Link consent to participant
    participant.consentLogId = consentLog.id;
    participant.screeningLogId = screeningId;
    
    // Update participant record
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participant.id);
    if (index !== -1) {
      participants[index] = participant;
      localStorage.setItem(this.storagePrefix + 'participants', JSON.stringify(participants));
    }
    
    return { participant, consentLog };
  }

  // Screening Analytics
  getScreeningAnalytics() {
    const screenings = this.getScreeningLogs();
    const total = screenings.length;
    const byStatus = {};
    const byStakeholder = {};
    
    screenings.forEach(screening => {
      byStatus[screening.status] = (byStatus[screening.status] || 0) + 1;
      byStakeholder[screening.stakeholderType] = (byStakeholder[screening.stakeholderType] || 0) + 1;
    });
    
    return {
      total,
      contacted: byStatus.contacted || 0,
      screened: byStatus.screened || 0,
      eligible: byStatus.eligible || 0,
      ineligible: byStatus.ineligible || 0,
      declined: byStatus.declined || 0,
      consented: byStatus.consented || 0,
      conversionRate: total > 0 ? ((byStatus.consented || 0) / total * 100).toFixed(1) : 0,
      eligibilityRate: total > 0 ? ((byStatus.eligible || 0) / total * 100).toFixed(1) : 0,
      byStakeholder
    };
  }

  // Screening Data Management
  saveScreening(screeningData) {
    const screenings = this.getScreenings();
    screenings.push(screeningData);
    localStorage.setItem(this.storagePrefix + 'screenings', JSON.stringify(screenings));
    return screeningData;
  }

  getScreenings() {
    const data = localStorage.getItem(this.storagePrefix + 'screenings');
    return data ? JSON.parse(data) : [];
  }

  getScreeningsByType(type) {
    return this.getScreenings().filter(s => s.type === type);
  }

  // Participant Tracking Management
  saveTrackedParticipant(participantData) {
    const tracked = this.getTrackedParticipants();
    const existingIndex = tracked.findIndex(p => p.id === participantData.id);
    
    if (existingIndex !== -1) {
      tracked[existingIndex] = participantData;
    } else {
      tracked.push(participantData);
    }
    
    localStorage.setItem(this.storagePrefix + 'tracked_participants', JSON.stringify(tracked));
    return participantData;
  }

  getTrackedParticipants(type = null) {
    const data = localStorage.getItem(this.storagePrefix + 'tracked_participants');
    const tracked = data ? JSON.parse(data) : [];
    return type ? tracked.filter(p => p.type === type + '-tracker') : tracked;
  }

  deleteTrackedParticipant(id) {
    const tracked = this.getTrackedParticipants();
    const filtered = tracked.filter(p => p.id !== id);
    localStorage.setItem(this.storagePrefix + 'tracked_participants', JSON.stringify(filtered));
    return true;
  }

  // Interview Data Management
  saveInterviewData(interviewData) {
    const interviews = this.getInterviews();
    interviews.push(interviewData);
    localStorage.setItem(this.storagePrefix + 'interviews', JSON.stringify(interviews));
    return interviewData;
  }

  getInterviews() {
    const data = localStorage.getItem(this.storagePrefix + 'interviews');
    return data ? JSON.parse(data) : [];
  }

  // Focus Group Data Management
  saveFGDData(fgdData) {
    const fgds = this.getFGDs();
    fgds.push(fgdData);
    localStorage.setItem(this.storagePrefix + 'fgds', JSON.stringify(fgds));
    return fgdData;
  }

  getFGDs() {
    const data = localStorage.getItem(this.storagePrefix + 'fgds');
    return data ? JSON.parse(data) : [];
  }

  // Audio Recording Management
  saveAudioLog(audioData) {
    const audioLogs = this.getAudioLogs();
    audioLogs.push(audioData);
    localStorage.setItem(this.storagePrefix + 'audio_logs', JSON.stringify(audioLogs));
    return audioData;
  }

  getAudioLogs() {
    const data = localStorage.getItem(this.storagePrefix + 'audio_logs');
    return data ? JSON.parse(data) : [];
  }

  // Transcription Management
  saveTranscription(transcriptionData) {
    const transcriptions = this.getTranscriptions();
    transcriptions.push(transcriptionData);
    localStorage.setItem(this.storagePrefix + 'transcriptions', JSON.stringify(transcriptions));
    return transcriptionData;
  }

  getTranscriptions() {
    const data = localStorage.getItem(this.storagePrefix + 'transcriptions');
    return data ? JSON.parse(data) : [];
  }

  // Field Notes Management
  saveFieldNote(noteData) {
    const notes = this.getFieldNotes();
    notes.push(noteData);
    localStorage.setItem(this.storagePrefix + 'field_notes', JSON.stringify(notes));
    return noteData;
  }

  getFieldNotes() {
    const data = localStorage.getItem(this.storagePrefix + 'field_notes');
    return data ? JSON.parse(data) : [];
  }

  // Enhanced Statistics for Recruitment Tools
  getRecruitmentStatistics() {
    const screenings = this.getScreenings();
    const tracked = this.getTrackedParticipants();
    
    // Count by type
    const patientScreenings = screenings.filter(s => s.type === 'patient-eligibility');
    const clinicianScreenings = screenings.filter(s => s.type === 'clinician-eligibility');
    const herbalistScreenings = screenings.filter(s => s.type === 'herbalist-eligibility');
    const policyScreenings = screenings.filter(s => s.type === 'policy-eligibility');
    
    const patientTracked = tracked.filter(t => t.type === 'patient-tracker');
    const clinicianTracked = tracked.filter(t => t.type === 'clinician-tracker');
    const herbalistTracked = tracked.filter(t => t.type === 'herbalist-tracker');
    const policyTracked = tracked.filter(t => t.type === 'policy-tracker');
    
    // Count eligible participants
    const eligiblePatients = patientScreenings.filter(s => s.isEligible).length;
    const eligibleClinicians = clinicianScreenings.filter(s => s.isEligible).length;
    const eligibleHerbalists = herbalistScreenings.filter(s => s.isEligible).length;
    const eligiblePolicy = policyScreenings.filter(s => s.isEligible).length;
    
    // Count enrolled participants
    const enrolledPatients = patientTracked.filter(t => t.status === 'enrolled').length;
    const enrolledClinicians = clinicianTracked.filter(t => t.status === 'enrolled').length;
    const enrolledHerbalists = herbalistTracked.filter(t => t.status === 'enrolled').length;
    const enrolledPolicy = policyTracked.filter(t => t.status === 'enrolled').length;
    
    // Today's screenings
    const today = new Date().toISOString().split('T')[0];
    const todayScreenings = screenings.filter(s => s.screeningDate === today).length;
    
    return {
      totalScreenings: screenings.length,
      eligibleParticipants: eligiblePatients + eligibleClinicians + eligibleHerbalists + eligiblePolicy,
      enrolledParticipants: enrolledPatients + enrolledClinicians + enrolledHerbalists + enrolledPolicy,
      todayScreenings,
      
      // By type
      patientScreenings: patientScreenings.length,
      clinicianScreenings: clinicianScreenings.length,
      herbalistScreenings: herbalistScreenings.length,
      policyScreenings: policyScreenings.length,
      
      eligiblePatients,
      eligibleClinicians,
      eligibleHerbalists,
      eligiblePolicy,
      
      trackedPatients: patientTracked.length,
      trackedClinicians: clinicianTracked.length,
      trackedHerbalists: herbalistTracked.length,
      trackedPolicy: policyTracked.length,
      
      enrolledPatients,
      enrolledClinicians,
      enrolledHerbalists,
      enrolledPolicy
    };
  }
}

// Audio Recorder Manager
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
  }
  
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.onRecordingComplete(audioBlob);
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    }
  }
  
  onRecordingComplete(audioBlob) {
    // Override this method to handle the completed recording
    console.log('Recording completed:', audioBlob);
  }
}

// Initialize global instances
const dataManager = new DataManager();
const audioRecorder = new AudioRecorder();

// Update stats on home page
function updateStats() {
  const stats = dataManager.getStats();
  const analytics = dataManager.getScreeningAnalytics();
  
  // Basic stats
  const totalParticipants = document.getElementById('totalParticipants');
  const totalScreenings = document.getElementById('totalScreenings');
  const totalInterviews = document.getElementById('totalInterviews');
  const totalAudio = document.getElementById('totalAudio');
  
  // Analytics
  const conversionRate = document.getElementById('conversionRate');
  const eligibilityRate = document.getElementById('eligibilityRate');
  
  if (totalParticipants) totalParticipants.textContent = stats.totalParticipants;
  if (totalScreenings) totalScreenings.textContent = stats.totalScreenings;
  if (totalInterviews) totalInterviews.textContent = stats.totalInterviews;
  if (totalAudio) totalAudio.textContent = stats.totalAudio;
  
  if (conversionRate) conversionRate.textContent = analytics.conversionRate + '%';
  if (eligibilityRate) eligibilityRate.textContent = analytics.eligibilityRate + '%';
}

// Update hero stats in addition to regular stats
function updateHeroStats() {
  try {
    const stats = dataManager.getStatistics();
    
    // Update hero section stats
    const heroParticipants = document.getElementById('heroTotalParticipants');
    const heroInterviews = document.getElementById('heroTotalInterviews'); 
    const heroConversion = document.getElementById('heroConversionRate');
    
    if (heroParticipants) heroParticipants.textContent = stats.totalParticipants;
    if (heroInterviews) heroInterviews.textContent = stats.totalInterviews;
    if (heroConversion) heroConversion.textContent = stats.conversionRate + '%';
    
    // Update circular progress indicators
    const conversionCircle = document.getElementById('conversionRateCircle');
    const eligibilityCircle = document.getElementById('eligibilityRateCircle');
    
    if (conversionCircle) conversionCircle.textContent = stats.conversionRate + '%';
    if (eligibilityCircle) eligibilityCircle.textContent = stats.eligibilityRate + '%';
    
  } catch (error) {
    console.warn('Error updating hero stats:', error);
  }
}

// Enhanced updateStatistics function
function updateStatistics() {
  try {
    const stats = dataManager.getStatistics();
    
    // Update all existing stats
    const elements = {
      'totalParticipants': stats.totalParticipants,
      'totalInterviews': stats.totalInterviews,
      'totalSessions': stats.totalSessions,
      'totalContacts': stats.totalContacts,
      'eligibleParticipants': stats.eligibleParticipants,
      'consentedParticipants': stats.consentedParticipants,
      'enrolledParticipants': stats.enrolledParticipants,
      'conversionRate': stats.conversionRate + '%',
      'eligibilityRate': stats.eligibilityRate + '%',
      'totalScreenings': stats.totalContacts,
      'totalAudio': 0 // Placeholder for audio files count
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    
    // Update hero stats
    updateHeroStats();
    
    console.log('Statistics updated:', stats);
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Add new stat display functions
function showScreeningStats() {
  const stats = dataManager.getStatistics();
  const message = `
Screening Statistics:
• Total Contacts: ${stats.totalContacts}
• Eligible Participants: ${stats.eligibleParticipants}
• Consented Participants: ${stats.consentedParticipants}
• Enrolled Participants: ${stats.enrolledParticipants}
• Conversion Rate: ${stats.conversionRate}%
• Eligibility Rate: ${stats.eligibilityRate}%
  `;
  
  app.dialog.alert(message, 'Screening Statistics');
}

function showInterviewStats() {
  const stats = dataManager.getStatistics();
  const participants = dataManager.getAllParticipants();
  const interviews = participants.filter(p => p.interviews && p.interviews.length > 0);
  
  const message = `
Interview Statistics:
• Total Interviews Completed: ${stats.totalInterviews}
• Participants with Interviews: ${interviews.length}
• Average Interviews per Participant: ${interviews.length ? (stats.totalInterviews / interviews.length).toFixed(1) : 0}
• Total Sessions: ${stats.totalSessions}
  `;
  
  app.dialog.alert(message, 'Interview Statistics');
}

function showDebriefStats() {
  const participants = dataManager.getAllParticipants();
  const debriefs = participants.reduce((count, p) => {
    return count + (p.debriefs ? p.debriefs.length : 0);
  }, 0);
  
  const message = `
Debriefing Statistics:
• Total Debrief Sessions: ${debriefs}
• Participants with Debriefs: ${participants.filter(p => p.debriefs && p.debriefs.length > 0).length}
• Research Quality Tracking: Active
  `;
  
  app.dialog.alert(message, 'Debriefing Statistics');
}

// Eligibility Criteria Data
const eligibilityCriteria = {
  patients: [
    { text: "Aged 18 years or older", required: true },
    { text: "Clinically diagnosed with hypertension (≥6 months)", required: true, comment: "Confirm via clinic records" },
    { text: "Currently using conventional and/or herbal treatments", required: true },
    { text: "Owns or has regular access to a smartphone", required: true },
    { text: "Willing to participate in digital N-of-1 trial", required: true },
    { text: "Able to provide informed consent", required: true }
  ],
  clinicians: [
    { text: "Aged 18 years or older", required: true },
    { text: "Registered/licensed medical professional in Ghana", required: true },
    { text: "≥6 months experience managing hypertensive patients", required: true },
    { text: "Located in Eastern Region and currently practicing", required: true },
    { text: "Comfortable with digital or mobile platforms", required: true },
    { text: "Willing to participate in interviews/workshops", required: true },
    { text: "Able to provide informed consent", required: true }
  ],
  herbalists: [
    { text: "Aged 18 years or older", required: true },
    { text: "Identifies as a traditional/herbal practitioner", required: true },
    { text: "≥6 months experience treating hypertension", required: true },
    { text: "Located in Eastern Region and serving local clients", required: true },
    { text: "Open to discussing treatment practices in research setting", required: true },
    { text: "Willing to engage in co-design or interviews", required: true },
    { text: "Able to provide informed consent", required: true }
  ],
  'policy-stakeholders': [
    { text: "Aged 18 years or older", required: true },
    { text: "Holds a relevant role in policy, regulation, or planning", required: true },
    { text: "Currently active in Ghana's health or NCD-related sectors", required: true },
    { text: "Familiar with digital health, innovation, or NCD policy", required: true },
    { text: "Willing to participate in stakeholder dialogue", required: true },
    { text: "Able to provide informed consent", required: true }
  ]
};

// Interview Guides Data
const interviewGuides = {
  patients: {
    objective: "Understand patients' experiences, treatment behaviours, and perspectives on integrating conventional and herbal care.",
    domains: [
      {
        title: "Diagnosis Experience",
        questions: [
          "Can you tell me the story of how you were diagnosed with hypertension?"
        ]
      },
      {
        title: "Treatment History",
        questions: [
          "What treatments have you used since diagnosis (e.g., clinic drugs, herbs, others)?"
        ]
      },
      {
        title: "Perceptions and Beliefs",
        questions: [
          "How do you view your current treatment?",
          "What do you believe causes or worsens BP?"
        ]
      },
      {
        title: "Integration Perspectives",
        questions: [
          "Would you be open to trying combined or personalised approaches (herbs + clinic)?"
        ]
      },
      {
        title: "Daily Routines & Challenges",
        questions: [
          "How do you manage taking your medications?",
          "Any difficulties or support received?"
        ]
      }
    ]
  },
  clinicians: {
    objective: "Explore professional insights on treatment practices, patient behaviours, and openness to integrative strategies.",
    domains: [
      {
        title: "Current Practice",
        questions: [
          "What are your common treatment approaches for hypertension patients?"
        ]
      },
      {
        title: "Observed Patient Behaviour",
        questions: [
          "What patterns have you noticed in patient adherence or use of alternative therapies?"
        ]
      },
      {
        title: "Attitudes Toward Integration",
        questions: [
          "How do you feel about integrating herbal or lifestyle interventions into treatment?"
        ]
      },
      {
        title: "System Constraints",
        questions: [
          "What health system barriers limit personalised or holistic care?"
        ]
      },
      {
        title: "Digital Readiness",
        questions: [
          "Would you be open to digital tools (e.g., N-of-1 platforms) to track treatment?"
        ]
      }
    ]
  },
  herbalists: {
    objective: "Capture knowledge of herbal care practices, patient patterns, and attitudes toward collaboration with biomedical care.",
    domains: [
      {
        title: "Common Treatments Used",
        questions: [
          "Which herbs or remedies do you commonly use for managing high blood pressure?"
        ]
      },
      {
        title: "Client Demographics",
        questions: [
          "Who are the people that come to you?",
          "What do they usually report?"
        ]
      },
      {
        title: "Integration Readiness",
        questions: [
          "Would you be willing to work with clinics or hospitals in a shared care model?"
        ]
      },
      {
        title: "Beliefs About Conventional Care",
        questions: [
          "What are your views on hospital-based hypertension treatment?"
        ]
      },
      {
        title: "Openness to Digital Tools",
        questions: [
          "Would you be open to recording patient data or participating in a digital study?"
        ]
      }
    ]
  },
  caregivers: {
    objective: "Understand the role of caregivers in supporting hypertensive patients and their beliefs about treatment.",
    domains: [
      {
        title: "Care Role",
        questions: [
          "What kind of support do you provide to the person with hypertension?"
        ]
      },
      {
        title: "Medication & Monitoring",
        questions: [
          "Do you help with reminders or observing their medication or symptoms?"
        ]
      },
      {
        title: "Beliefs About Treatment",
        questions: [
          "What are your thoughts on using clinic medicines versus herbs or spiritual help?"
        ]
      },
      {
        title: "Experience with Health System",
        questions: [
          "Have you had interactions with health workers or herbalists for your relative?"
        ]
      },
      {
        title: "Attitude Toward Integration",
        questions: [
          "Would you support trying both hospital and herbal treatments if advised?"
        ]
      }
    ]
  }
};

// Navigation Helper Functions
function navigateToPage(url) {
  if (app.views.main) {
    app.views.main.router.navigate(url);
  } else {
    console.error('Main view not initialized');
  }
}

function goBack() {
  if (app.views.main) {
    app.views.main.router.back();
  }
}

// Page-specific initialization functions
function initializeEligibilityPage() {
  console.log('Initializing eligibility page...');
  // Load stakeholder types and criteria
  loadStakeholderTypes();
}

function initializeInterviewPage() {
  console.log('Initializing interview page...');
  // Load interview guides and setup audio recording
  loadInterviewGuides();
  setupAudioRecording();
}

function initializeDataEntryPage() {
  console.log('Initializing data entry page...');
  // Load participant list and setup forms
  loadParticipantList();
}

function initializeViewRecordsPage() {
  console.log('Initializing view records page...');
  // Load and display all records
  loadAllRecords();
}

// Audio Recording Functions
function setupAudioRecording() {
  // Check if browser supports audio recording
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('Audio recording not supported in this browser');
    return false;
  }
  return true;
}

function startAudioRecording() {
  return audioRecorder.startRecording();
}

function stopAudioRecording() {
  audioRecorder.stopRecording();
}

// Form Helper Functions
function loadStakeholderTypes() {
  const select = document.getElementById('stakeholderType');
  if (select) {
    const types = [
      { value: 'patients', label: 'Patients' },
      { value: 'clinicians', label: 'Clinicians' },
      { value: 'herbalists', label: 'Herbalists' },
      { value: 'policy-stakeholders', label: 'Policy Stakeholders' },
      { value: 'caregivers', label: 'Caregivers' }
    ];
    
    select.innerHTML = '<option value="">Select Stakeholder Type</option>';
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type.value;
      option.textContent = type.label;
      select.appendChild(option);
    });
  }
}

function loadInterviewGuides() {
  // This will be called when interview page loads
  console.log('Interview guides loaded');
}

function loadParticipantList() {
  const participants = dataManager.getParticipants();
  const select = document.getElementById('participantSelect');
  if (select) {
    select.innerHTML = '<option value="">Select Participant</option>';
    participants.forEach(participant => {
      const option = document.createElement('option');
      option.value = participant.id;
      option.textContent = `${participant.id} - ${participant.stakeholderType}`;
      select.appendChild(option);
    });
  }
}

function loadAllRecords() {
  const participants = dataManager.getParticipants();
  const interviews = dataManager.getInterviews();
  const audioFiles = dataManager.getAudioFiles();
  
  console.log('Loaded records:', {
    participants: participants.length,
    interviews: interviews.length,
    audioFiles: audioFiles.length
  });
}

// Data Export Functions
function exportAllData() {
  try {
    dataManager.exportData('json');
    app.toast.create({
      text: 'Data exported successfully!',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  } catch (error) {
    console.error('Export error:', error);
    app.toast.create({
      text: 'Failed to export data',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  }
}

function exportCSVData() {
  try {
    const data = {
      participants: dataManager.getParticipants(),
      interviews: dataManager.getInterviews(),
      audioFiles: dataManager.getAudioFiles(),
      fieldLogs: dataManager.getFieldLogs()
    };
    dataManager.exportCSV(data);
    app.toast.create({
      text: 'CSV files exported successfully!',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  } catch (error) {
    console.error('CSV export error:', error);
    app.toast.create({
      text: 'Failed to export CSV files',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  }
}

// Simple navigation function as fallback
function simpleNavigate(url) {
  window.location.href = url;
}

// Form submission helpers
function submitEligibilityForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const result = dataManager.saveParticipant(data);
    app.toast.create({
      text: `Participant ${result.id} saved successfully!`,
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
    
    // Clear form
    event.target.reset();
  } catch (error) {
    console.error('Error saving participant:', error);
    app.toast.create({
      text: 'Failed to save participant data',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  }
}

function submitInterviewData(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const result = dataManager.saveInterview(data);
    app.toast.create({
      text: `Interview ${result.id} saved successfully!`,
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
    
    // Clear form
    event.target.reset();
  } catch (error) {
    console.error('Error saving interview:', error);
    app.toast.create({
      text: 'Failed to save interview data',
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  }
}

// Audio recording state management
let isRecording = false;
let recordingStartTime = null;

function toggleRecording() {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  if (setupAudioRecording()) {
    audioRecorder.startRecording().then(success => {
      if (success) {
        isRecording = true;
        recordingStartTime = Date.now();
        updateRecordingUI(true);
        
        app.toast.create({
          text: 'Recording started',
          position: 'bottom',
          closeTimeout: 2000,
        }).open();
      } else {
        app.toast.create({
          text: 'Failed to start recording',
          position: 'bottom',
          closeTimeout: 3000,
        }).open();
      }
    });
  }
}

function stopRecording() {
  if (isRecording) {
    audioRecorder.stopRecording();
    isRecording = false;
    updateRecordingUI(false);
    
    const duration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0;
    
    app.toast.create({
      text: `Recording stopped (${duration.toFixed(1)}s)`,
      position: 'bottom',
      closeTimeout: 3000,
    }).open();
  }
}

function updateRecordingUI(recording) {
  const recordButton = document.getElementById('recordButton');
  const recordIcon = document.getElementById('recordIcon');
  const recordText = document.getElementById('recordText');
  
  if (recordButton) {
    recordButton.classList.toggle('recording', recording);
  }
  
  if (recordIcon) {
    recordIcon.textContent = recording ? 'stop' : 'mic';
  }
  
  if (recordText) {
    recordText.textContent = recording ? 'Stop Recording' : 'Start Recording';
  }
}

// Page-specific event handlers
function handlePageInit(pageName) {
  console.log(`Page initialized: ${pageName}`);
  
  switch (pageName) {
    case 'eligibility-checklist':
      initializeEligibilityPage();
      break;
    case 'interview-guide':
      initializeInterviewPage();
      break;
    case 'data-entry':
      initializeDataEntryPage();
      break;
    case 'view-records':
      initializeViewRecordsPage();
      break;
    case 'audio-log':
      if (window.audioLibrary) {
        window.audioLibrary.initialize();
      }
      break;
  }
}

// Listen for page init events
document.addEventListener('page:init', function (e) {
  handlePageInit(e.detail.name);
});

// Utility function to show success messages
function showSuccess(message) {
  app.toast.create({
    text: message,
    position: 'bottom',
    closeTimeout: 3000,
  }).open();
}

// Utility function to show error messages
function showError(message) {
  app.toast.create({
    text: message,
    position: 'bottom',
    closeTimeout: 3000,
  }).open();
}

// Initialize app when document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing QualiData application...');
  
  // Initialize main view if it doesn't exist
  if (!app.views.main) {
    app.views.create('.view-main', {
      url: '/'
    });
  }
  
  // Update all statistics
  updateStats();
  updateStatistics(); // Call both for compatibility
  
  // Set up periodic updates
  setInterval(() => {
    updateStats();
    updateStatistics();
  }, 5000);
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed');
      });
  }
  
  console.log('QualiData application initialization complete');
});

// Export globals for use in pages
window.app = app;
window.mainView = mainView;
window.dataManager = dataManager;
window.audioRecorder = audioRecorder;
window.eligibilityCriteria = eligibilityCriteria;
window.interviewGuides = interviewGuides;
window.updateStats = updateStats;
window.updateStatistics = updateStatistics;
window.updateHeroStats = updateHeroStats;
window.showScreeningStats = showScreeningStats;
window.showInterviewStats = showInterviewStats;
window.showDebriefStats = showDebriefStats;
window.navigateToPage = navigateToPage;
window.goBack = goBack;
window.startAudioRecording = startAudioRecording;
window.stopAudioRecording = stopAudioRecording;
window.exportAllData = exportAllData;
window.exportCSVData = exportCSVData;
window.initializeEligibilityPage = initializeEligibilityPage;
window.initializeInterviewPage = initializeInterviewPage;
window.initializeDataEntryPage = initializeDataEntryPage;
window.initializeViewRecordsPage = initializeViewRecordsPage;
window.simpleNavigate = simpleNavigate;
window.submitEligibilityForm = submitEligibilityForm;
window.submitInterviewData = submitInterviewData;
window.toggleRecording = toggleRecording;
window.startRecording = startRecording;
window.stopRecording = stopRecording;
window.showSuccess = showSuccess;
window.showError = showError;
window.handlePageInit = handlePageInit;
