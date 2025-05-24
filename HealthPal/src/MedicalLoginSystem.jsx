import React, { useState } from 'react';
// Import the CSS file: import './MedicalSystem.css';

const MedicalLoginSystem = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard'
  const [doctors, setDoctors] = useState([]); // Store registered doctors
  const [patients, setPatients] = useState([]); // Store registered patients
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Patient registration form state
  const [patientForm, setPatientForm] = useState({
    patientName: '',
    nextAppointment: '',
    medicationName: '',
    dosage: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRegistration = () => {
    const newErrors = {};
    
    if (!registerForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    
    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePatientForm = () => {
    const newErrors = {};
    
    if (!patientForm.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    
    if (!patientForm.nextAppointment) {
      newErrors.nextAppointment = 'Next appointment date is required';
    }
    
    if (!patientForm.medicationName.trim()) {
      newErrors.medicationName = 'Medication name is required';
    }
    
    if (!patientForm.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    
    if (!patientForm.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submissions
  const handleRegister = () => {
    if (validateRegistration()) {
      const newDoctor = {
        id: Date.now(),
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password
      };
      setDoctors([...doctors, newDoctor]);
      setRegisterForm({ fullName: '', email: '', password: '', confirmPassword: '' });
      setCurrentView('login');
      alert('Registration successful! Please log in.');
    }
  };

  const handleLogin = () => {
    if (validateLogin()) {
      const doctor = doctors.find(d => 
        d.email === loginForm.email && d.password === loginForm.password
      );
      if (doctor) {
        setCurrentDoctor(doctor);
        setCurrentView('dashboard');
        setLoginForm({ email: '', password: '' });
      } else {
        setErrors({ login: 'Invalid email or password' });
      }
    }
  };

  const handlePatientRegistration = () => {
    if (validatePatientForm()) {
      const newPatient = {
        id: Date.now(),
        doctorId: currentDoctor.id,
        ...patientForm,
        registeredAt: new Date().toLocaleDateString()
      };
      setPatients([...patients, newPatient]);
      setPatientForm({
        patientName: '',
        nextAppointment: '',
        medicationName: '',
        dosage: '',
        instructions: ''
      });
      alert('Patient registered successfully!');
    }
  };

  // Get current doctor's patients
  const currentDoctorPatients = patients.filter(p => p.doctorId === currentDoctor?.id);

  return (
    <div className="app-container">
      <div className="form-container">
        {currentView === 'login' && (
          <div className="card">
            <div className="header">
              <h1>Medical Practice</h1>
              <p>Doctor Login Portal</p>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="form-input"
                  placeholder="doctor@example.com"
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="form-input"
                  placeholder="••••••••"
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              {errors.login && <p className="error-message">{errors.login}</p>}

              <button
                onClick={handleLogin}
                className="btn btn-primary"
              >
                Sign In
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentView('register')}
                  className="link link-burgundy"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div className="card">
            <div className="header">
              <h1>Doctor Registration</h1>
              <p>Create your account</p>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                  className="form-input"
                  placeholder="Dr. John Smith"
                />
                {errors.fullName && <p className="error-message">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="regEmail" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="regEmail"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="form-input"
                  placeholder="doctor@example.com"
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="regPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="regPassword"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="form-input"
                  placeholder="••••••••"
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  className="form-input"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
              </div>

              <button
                onClick={handleRegister}
                className="btn btn-secondary"
              >
                Register
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="link link-teal"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="dashboard-container">
            {/* Welcome Header */}
            <div className="card">
              <div className="dashboard-header">
                <div>
                  <h1>Welcome, {currentDoctor.fullName}</h1>
                  <p>Patient Registration Dashboard</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentDoctor(null);
                    setCurrentView('login');
                  }}
                  className="btn btn-gray btn-small"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Patient Registration Form */}
            <div className="card">
              <h2 className="section-title">Register New Patient</h2>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="patientName" className="form-label">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    value={patientForm.patientName}
                    onChange={(e) => setPatientForm({...patientForm, patientName: e.target.value})}
                    className="form-input"
                    placeholder="Jane Doe"
                  />
                  {errors.patientName && <p className="error-message">{errors.patientName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="nextAppointment" className="form-label">
                    Next Appointment Date
                  </label>
                  <input
                    type="date"
                    id="nextAppointment"
                    value={patientForm.nextAppointment}
                    onChange={(e) => setPatientForm({...patientForm, nextAppointment: e.target.value})}
                    className="form-input"
                  />
                  {errors.nextAppointment && <p className="error-message">{errors.nextAppointment}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="medicationName" className="form-label">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    id="medicationName"
                    value={patientForm.medicationName}
                    onChange={(e) => setPatientForm({...patientForm, medicationName: e.target.value})}
                    className="form-input"
                    placeholder="Amoxicillin"
                  />
                  {errors.medicationName && <p className="error-message">{errors.medicationName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="dosage" className="form-label">
                    Dosage
                  </label>
                  <input
                    type="text"
                    id="dosage"
                    value={patientForm.dosage}
                    onChange={(e) => setPatientForm({...patientForm, dosage: e.target.value})}
                    className="form-input"
                    placeholder="500mg"
                  />
                  {errors.dosage && <p className="error-message">{errors.dosage}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="instructions" className="form-label">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={patientForm.instructions}
                    onChange={(e) => setPatientForm({...patientForm, instructions: e.target.value})}
                    className="form-textarea"
                    placeholder="Take twice daily after meals"
                  />
                  {errors.instructions && <p className="error-message">{errors.instructions}</p>}
                </div>

                <button
                  onClick={handlePatientRegistration}
                  className="btn btn-primary"
                >
                  Register Patient
                </button>
              </div>
            </div>

            {/* Patient List */}
            {currentDoctorPatients.length > 0 && (
              <div className="card">
                <h2 className="section-title">Your Patients ({currentDoctorPatients.length})</h2>
                <div className="patient-list">
                  {currentDoctorPatients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                      <div className="patient-header">
                        <div className="flex-1">
                          <h3 className="patient-name">{patient.patientName}</h3>
                          <p className="patient-appointment">
                            Next Appointment: {new Date(patient.nextAppointment).toLocaleDateString()}
                          </p>
                          <div className="patient-details mt-2">
                            <p>
                              <span className="detail-label">Medication:</span> {patient.medicationName} - {patient.dosage}
                            </p>
                            <p>
                              <span className="detail-label">Instructions:</span> {patient.instructions}
                            </p>
                          </div>
                        </div>
                        <span className="patient-badge">
                          Registered: {patient.registeredAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalLoginSystem;