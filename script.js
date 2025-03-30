document.addEventListener('DOMContentLoaded', function() {
    // Initialize common pregnancy symptoms
    const commonSymptoms = [
        'Nausea', 'Fatigue', 'Headache', 'Back Pain',
        'Swelling', 'Heartburn', 'Insomnia', 'Mood Swings',
        'Cramping', 'Spotting', 'Breast Tenderness'
    ];

    // Create symptom checkboxes
    const symptomsGrid = document.getElementById('symptoms-grid');
    commonSymptoms.forEach(symptom => {
        const div = document.createElement('div');
        div.className = 'symptom-item';
        div.innerHTML = `
            <i class="far fa-circle"></i>
            <span>${symptom}</span>
        `;
        div.onclick = () => {
            div.classList.toggle('selected');
            const icon = div.querySelector('i');
            icon.className = div.classList.contains('selected') ? 'fas fa-check-circle' : 'far fa-circle';
        };
        symptomsGrid.appendChild(div);
    });

    // Load existing data
    loadPregnancyInfo();
    loadAppointments();
    loadHealthHistory();
});

function calculatePregnancyInfo() {
    const lmpDate = new Date(document.getElementById('lmp').value);
    if (!lmpDate || isNaN(lmpDate)) return null;

    const today = new Date();
    const pregnancyStart = new Date(lmpDate);
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280); // 40 weeks

    const weeksDifference = Math.floor((today - pregnancyStart) / (1000 * 60 * 60 * 24 * 7));
    const trimester = Math.floor(weeksDifference / 13) + 1;

    return {
        dueDate,
        currentWeek: weeksDifference,
        trimester: trimester > 3 ? 3 : trimester,
        progress: (weeksDifference / 40) * 100
    };
}

function loadPregnancyInfo() {
    const info = calculatePregnancyInfo();
    if (!info) return;

    const pregnancyInfo = document.getElementById('pregnancy-info');
    pregnancyInfo.innerHTML = `
        <div class="pregnancy-details">
            <p><strong>Due Date:</strong> ${info.dueDate.toLocaleDateString()}</p>
            <p><strong>Current Week:</strong> ${info.currentWeek}</p>
            <p><strong>Trimester:</strong> ${info.trimester}</p>
        </div>
        <div class="trimester-progress">
            <p>Pregnancy Progress</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${info.progress}%"></div>
            </div>
        </div>
    `;
}

function saveHealthRecord() {
    const weight = document.getElementById('weight').value;
    const bloodPressure = document.getElementById('blood-pressure').value;
    const selectedSymptoms = Array.from(document.getElementsByClassName('symptom-item'))
        .filter(item => item.classList.contains('selected'))
        .map(item => item.querySelector('span').textContent);

    if (!weight || !bloodPressure) {
        alert('Please enter weight and blood pressure');
        return;
    }

    const record = {
        date: new Date().toISOString(),
        weight,
        bloodPressure,
        symptoms: selectedSymptoms
    };

    let history = JSON.parse(localStorage.getItem('healthHistory') || '[]');
    history.unshift(record);
    localStorage.setItem('healthHistory', JSON.stringify(history));

    loadHealthHistory();
    clearHealthForm();
}

function saveAppointment() {
    const date = document.getElementById('appointment-date').value;
    const type = document.getElementById('appointment-type').value;
    const notes = document.getElementById('appointment-notes').value;

    if (!date || !type) {
        alert('Please enter appointment date and type');
        return;
    }

    const appointment = {
        date,
        type,
        notes
    };

    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('appointments', JSON.stringify(appointments));

    loadAppointments();
    clearAppointmentForm();
}

function loadHealthHistory() {
    const history = JSON.parse(localStorage.getItem('healthHistory') || '[]');
    const historyDiv = document.getElementById('health-history');
    
    historyDiv.innerHTML = history.map(record => `
        <div class="health-record">
            <p><strong>Date:</strong> ${new Date(record.date).toLocaleDateString()}</p>
            <p><strong>Weight:</strong> ${record.weight} kg</p>
            <p><strong>Blood Pressure:</strong> ${record.bloodPressure}</p>
            <p><strong>Symptoms:</strong> ${record.symptoms.join(', ') || 'None'}</p>
        </div>
    `).join('');
}

function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointmentsList = document.getElementById('appointments-list');
    
    appointmentsList.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <p><strong>Date:</strong> ${new Date(apt.date).toLocaleString()}</p>
            <p><strong>Type:</strong> ${apt.type}</p>
            ${apt.notes ? `<p><strong>Notes:</strong> ${apt.notes}</p>` : ''}
        </div>
    `).join('');
}

function clearHealthForm() {
    document.getElementById('weight').value = '';
    document.getElementById('blood-pressure').value = '';
    document.querySelectorAll('.symptom-item.selected').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('i').className = 'far fa-circle';
    });
}

function clearAppointmentForm() {
    document.getElementById('appointment-date').value = '';
    document.getElementById('appointment-type').selectedIndex = 0;
    document.getElementById('appointment-notes').value = '';
}

// Update pregnancy info when LMP changes
document.getElementById('lmp').addEventListener('change', loadPregnancyInfo);
