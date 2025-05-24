import React, { useState, useEffect } from 'react';

const MedicalLoginSystem = () => {
  const [currentView, setCurrentView] = useState('login');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Patient registration form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    phone: '',
    preferred_reminder_method: 'SMS',
    appointmentDate: '',
    appointmentTime: '',
    medicationName: '',
    dosage: '',
    instructions: '',
    scheduleTime: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentView === 'dashboard' && token) {
      fetchData();
    }
  }, [currentView, token]);

  const fetchData = async () => {
    try {
      const [patientsRes, appointmentsRes, medicationsRes] = await Promise.all([
        fetch('/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/medications', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const medicationsData = await medicationsRes.json();

      setPatients(patientsData.patients);
      setAppointments(appointmentsData.appointments);
      setMedications(medicationsData.medications);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRegistration = () => {
    const newErrors = {};
    if (!registerForm.name.trim()) newErrors.name = 'Full name is required';
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (registerForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (registerForm.password !== registerForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginForm.email.trim()) newErrors.email = 'Email is required';
    if (!loginForm.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePatientForm = () => {
    const newErrors = {};
    if (!patientForm.name.trim()) newErrors.name = 'Patient name is required';
    if (!patientForm.age) newErrors.age = 'Age is required';
    if (isNaN(patientForm.age)) newErrors.age = 'Age must be a number';
    if (!patientForm.phone.trim()) newErrors.phone = 'Phone is required';
    if (!patientForm.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!patientForm.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
    if (!patientForm.medicationName.trim()) newErrors.medicationName = 'Medication name is required';
    if (!patientForm.dosage.trim()) newErrors.dosage = 'Dosage is required';
    if (!patientForm.scheduleTime) newErrors.scheduleTime = 'Schedule time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegistration()) return;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setCurrentView('login');
      alert('Registration successful! Please log in.');
    } catch (error) {
      setErrors({ register: error.message });
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setCurrentDoctor(data.doctor);
      setCurrentView('dashboard');
    } catch (error) {
      setErrors({ login: error.message });
    }
  };

  const handlePatientRegistration = async () => {
    if (!validatePatientForm()) return;

    try {
      // Create patient
      const patientRes = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: patientForm.name,
          age: patientForm.age,
          phone: patientForm.phone,
          preferred_reminder_method: patientForm.preferred_reminder_method
        })
      });
      const patientData = await patientRes.json();
      if (!patientRes.ok) throw new Error(patientData.message);

      // Create appointment
      await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientData.patient.id,
          date: patientForm.appointmentDate,
          time: patientForm.appointmentTime,
          notes: patientForm.instructions
        })
      });

      // Create medication
      await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientData.patient.id,
          name: patientForm.medicationName,
          dosage: patientForm.dosage,
          instructions: patientForm.instructions,
          schedule_time: patientForm.scheduleTime
        })
      });

      setPatientForm({
        name: '',
        age: '',
        phone: '',
        preferred_reminder_method: 'SMS',
        appointmentDate: '',
        appointmentTime: '',
        medicationName: '',
        dosage: '',
        instructions: '',
        scheduleTime: ''
      });
      
      fetchData();
      alert('Patient registered successfully!');
    } catch (error) {
      setErrors({ patient: error.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentDoctor(null);
    setCurrentView('login');
  };

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
                <label>Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="doctor@example.com"
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="••••••••"
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>

              {errors.login && <p className="error">{errors.login}</p>}

              <button onClick={handleLogin} className="btn primary">
                Sign In
              </button>
            </div>

            <div className="footer">
              <p>
                Don't have an account?{' '}
                <button onClick={() => setCurrentView('register')}>
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
                <label>Full Name</label>
                <input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  placeholder="Dr. John Smith"
                />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  placeholder="doctor@example.com"
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  placeholder="••••••••"
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
              </div>

              {errors.register && <p className="error">{errors.register}</p>}

              <button onClick={handleRegister} className="btn secondary">
                Register
              </button>
            </div>

            <div className="footer">
              <p>
                Already have an account?{' '}
                <button onClick={() => setCurrentView('login')}>
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="dashboard-container">
            <div className="card">
              <div className="dashboard-header">
                <div>
                  <h1>Welcome, {currentDoctor?.name}</h1>
                  <p>Patient Management Dashboard</p>
                </div>
                <button onClick={handleLogout} className="btn gray">
                  Logout
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Register New Patient</h2>
              <div className="space-y-6">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                  />
                  {errors.name && <p className="error">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({...patientForm, age: e.target.value})}
                  />
                  {errors.age && <p className="error">{errors.age}</p>}
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
                  />
                  {errors.phone && <p className="error">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <label>Reminder Method</label>
                  <select
                    value={patientForm.preferred_reminder_method}
                    onChange={(e) => setPatientForm({...patientForm, preferred_reminder_method: e.target.value})}
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Appointment Date</label>
                  <input
                    type="date"
                    value={patientForm.appointmentDate}
                    onChange={(e) => setPatientForm({...patientForm, appointmentDate: e.target.value})}
                  />
                  {errors.appointmentDate && <p className="error">{errors.appointmentDate}</p>}
                </div>

                <div className="form-group">
                  <label>Appointment Time</label>
                  <input
                    type="time"
                    value={patientForm.appointmentTime}
                    onChange={(e) => setPatientForm({...patientForm, appointmentTime: e.target.value})}
                  />
                  {errors.appointmentTime && <p className="error">{errors.appointmentTime}</p>}
                </div>

                <div className="form-group">
                  <label>Medication Name</label>
                  <input
                    value={patientForm.medicationName}
                    onChange={(e) => setPatientForm({...patientForm, medicationName: e.target.value})}
                  />
                  {errors.medicationName && <p className="error">{errors.medicationName}</p>}
                </div>

                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    value={patientForm.dosage}
                    onChange={(e) => setPatientForm({...patientForm, dosage: e.target.value})}
                  />
                  {errors.dosage && <p className="error">{errors.dosage}</p>}
                </div>

                <div className="form-group">
                  <label>Schedule Time</label>
                  <input
                    type="time"
                    value={patientForm.scheduleTime}
                    onChange={(e) => setPatientForm({...patientForm, scheduleTime: e.target.value})}
                  />
                  {errors.scheduleTime && <p className="error">{errors.scheduleTime}</p>}
                </div>

                <div className="form-group">
                  <label>Instructions</label>
                  <textarea
                    value={patientForm.instructions}
                    onChange={(e) => setPatientForm({...patientForm, instructions: e.target.value})}
                  />
                </div>

                {errors.patient && <p className="error">{errors.patient}</p>}

                <button onClick={handlePatientRegistration} className="btn primary">
                  Register Patient
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Patients ({patients.length})</h2>
              <div className="patient-list">
                {patients.map(patient => {
                  const patientAppointments = appointments.filter(a => a.patient_id === patient.id);
                  const patientMedications = medications.filter(m => m.patient_id === patient.id);

                  return (
                    <div key={patient.id} className="patient-card">
                      <h3>{patient.name}</h3>
                      <p>Phone: {patient.phone}</p>
                      <p>Age: {patient.age}</p>
                      <p>Reminder Method: {patient.preferred_reminder_method}</p>

                      <div className="appointments">
                        <h4>Appointments:</h4>
                        {patientAppointments.map(appointment => (
                          <div key={appointment.id}>
                            <p>Date: {appointment.date} {appointment.time}</p>
                            <p>Notes: {appointment.notes}</p>
                          </div>
                        ))}
                      </div>

                      <div className="medications">
                        <h4>Medications:</h4>
                        {patientMedications.map(medication => (
                          <div key={medication.id}>
                            <p>{medication.name} - {medication.dosage}</p>
                            <p>Time: {medication.schedule_time}</p>
                            <p>Instructions: {medication.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalLoginSystem;