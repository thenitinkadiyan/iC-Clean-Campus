const adminID1 = "123848";
const adminPassword1 = "nitin";
const adminID2 = "123745";
const adminPassword2 = "deepali";
const staffID1 = "115044";
const staffPassword1 = "mobashir";
const studentID1 = "123781";
const studentPassword1 = "tanisha";
const studentID2 = "124460";
const studentPassword2 = "gurpreet";
const studentID3 = "123902";
const studentPassword3 = "charu";

function login(){
        const id = document.querySelector('.login-box input[type="text"]').value;
        const password = document.querySelector('.login-box input[type="password"]').value;
    if(id===""||password===""){
        alert("ERROR: Please enter both ID and Password");
        return;
    }
    if(id===adminID1 && password===adminPassword1){
        window.location.href = "admin-dashboard.html";
        return;
    }
    if(id===adminID2 && password===adminPassword2){
        window.location.href = "admin-dashboard.html";
        return;
    }
    if(id===staffID1 && password===staffPassword1){
        window.location.href = "staff-dashboard.html";
        return;
    }
    if(id===studentID1 && password===studentPassword1){
        window.location.href = "student-dashboard.html";
        return;
    }
    if(id===studentID2 && password===studentPassword2){
        window.location.href = "student-dashboard.html";
        return;
    }
    if(id===studentID3 && password===studentPassword3){
        window.location.href = "student-dashboard.html";
        return;
    }
    let students=JSON.parse(localStorage.getItem("students"))||[];
    let student=students.find(function(s){
        return s.grNumber===id && s.password===password;
    });
    if(student){
        window.location.href="student-dashboard.html";
        return;
    }
    alert("ERROR: Invalid ID or Password");
}
function registerStudent(){
        const name= document.getElementById("studentName").value;
        const grNumber= document.getElementById("studentGR").value;
        const password= document.getElementById("studentPassword").value;
        const confirmPassword= document.getElementById("confirmPassword").value;
        if(name===""||grNumber===""||password===""||confirmPassword===""){
            alert("ERROR: Please fill all Fields");
            return;
        }
        if(password !==confirmPassword){
            alert("ERROR:Passwords do not match");
            return;
        }
    let students=JSON.parse(localStorage.getItem("students"))||[];
    students.push({
        name:name,
        grNumber:grNumber,
        password:password
    });
    localStorage.setItem("students",JSON.stringify(students));
    alert("Registration Successfull!");
    
    window.location.href="login.html";
}
let map;
let marker;

function initMap() {
    map = L.map('map').setView([30.7046, 76.7179], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
setTimeout(function(){
    map.invalidateSize();
},300);
    map.on('click', function(e) {
        setLocation(e.latlng.lat, e.latlng.lng);
    });
}

function setLocation(lat, lng) {

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lng]).addTo(map);

    document.getElementById("locationText").value =
        lat.toFixed(6) + ", " + lng.toFixed(6);
}

function getCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Location is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 17);
            setLocation(lat, lng);
        },
        function() {
            alert("Unable to get your current location.");
        }
    );
}
function submitReport() {
    const photo = document.getElementById("garbagePhoto").files[0];
    const location = document.getElementById("locationText").value;
    const description = document.getElementById("description").value;
    if (!photo || location === "" || description === "") {
        alert("ERROR: Please fill all details");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        let reports = JSON.parse(localStorage.getItem("report")) || [];
        reports.push({
            photo: event.target.result,
            location: location,
            description: description,
            status: "In Progress",
            assignedStaff: "Staff 02",
            date: new Date().toLocaleString()
        });
        localStorage.setItem("report", JSON.stringify(reports));
        alert("Report Submitted Successfully!\n\nStaff 02 has been assigned automatically.");
        window.location.href = "student-dashboard.html";
    };
    reader.readAsDataURL(photo);
}
function updateReportCount(){
    let report= JSON.parse(localStorage.getItem("report"))||[];
    document.getElementById("reportCount").textContent=report.Length;
}
if(document.getElementById("reportCount")){
    updateReportCount();
}
function updateResolvedCount() {
    let reports = JSON.parse(localStorage.getItem("report")) || [];
    let resolvedReports = reports.filter(function(report) {
        return report.status === "Resolved";
    });

    document.getElementById("resolvedCount").textContent = resolvedReports.length;
}
function loadAdminReports() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    let reportsList = document.getElementById("reportsList");

    if (!reportsList) {
        return;
    }

    if (reports.length === 0) {
        reportsList.innerHTML = "<p>No reports submitted yet.</p>";
        return;
    }

    reportsList.innerHTML = "";

    reports.forEach(function(report, index) {

        let assignedStaff = report.assignedStaff || "Not Assigned";

        reportsList.innerHTML += `
            <div class="admin-report-card">

                <div class="admin-report-top">
                    <h3>Report #${index + 1}</h3>
                    <span class="report-status ${report.status.toLowerCase().replace(" ", "-")}">
                        ${report.status}
                    </span>
                </div>

                <p>
                    <strong>📍 Location:</strong>
                    ${report.location}
                </p>

                <p>
                    <strong>📝 Problem:</strong>
                    ${report.description}
                </p>

                <p>
                    <strong>👷 Assigned Staff:</strong>
                    ${assignedStaff}
                </p>

                <p>
                    <strong>🕐 Reported:</strong>
                    ${report.date}
                </p>

            </div>
        `;
    });
}
function resolveReport(index) {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    reports[index].status = "Resolved";

    localStorage.setItem("report", JSON.stringify(reports));

    loadAdminReports();
    updateAdminStats();
}
if(document.getElementById("reportsList")){
    loadAdminReports();
}
function updateAdminStats() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    let total = reports.length;

    let pending = reports.filter(function(report) {
        return report.status === "Pending";
    }).length;

    let inProgress = reports.filter(function(report) {
        return report.status === "In Progress";
    }).length;

    let resolved = reports.filter(function(report) {
        return report.status === "Resolved";
    }).length;


    document.getElementById("totalReports").textContent = total;
    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("inProgressReports").textContent = inProgress;
    document.getElementById("resolvedReports").textContent = resolved;
}
if(document.getElementById("totalReports")){
    updateAdminStats();
}
function completeCleaning() {

    const photo = document.getElementById("afterPhoto").files[0];

    if (!photo) {
        alert("Please upload after-cleaning photo");
        return;
    }

    // Reports localStorage se lena
    let reports = JSON.parse(localStorage.getItem("report")) || [];

    if (reports.length === 0) {
        alert("No report found");
        return;
    }

    // Latest report ko update karna
    let index = reports.length - 1;

    reports[index].assignedStaff = "Staff 02";
    reports[index].cleaningCompleted = true;
    reports[index].status = "Verification Pending";

    // Updated report save karna
    localStorage.setItem("report", JSON.stringify(reports));

    // Staff task ko completed dikhana
    document.querySelector(".task-card").innerHTML = `
        <h3>✅ Cleaning Completed</h3>

        <p>Cleaning photo has been submitted successfully.</p>

        <p>
            <strong>Status:</strong>
            Verification Pending
        </p>

        <p>
            🤖 AI is verifying the after-cleaning photo.
        </p>
    `;
}
function viewTaskLocation(){
    window.open(
        "https://www.google.com/maps/search/?api=1&query=CGC+University+Mohali+Jhanjeri",
        "_blank"
    );
}
function loadStaffTask() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    if (reports.length === 0) {
        return;
    }

    // Latest report jisme student ki photo available hai
    let report = reports.slice().reverse().find(function(r) {
        return r.photo;
    });

    const photo = document.getElementById("studentReportPhoto");

    if (!photo || !report) {
        return;
    }

    photo.src = report.photo;
    photo.style.display = "block";
}
if(document.getElementById("studentReportPhoto")){
    loadStaffTask();
}
function loadMyComplaints() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const complaintsList = document.getElementById("complaintsList");

    if (!complaintsList) {
        return;
    }

    if (reports.length === 0) {
        complaintsList.innerHTML = `
            <div class="no-complaints">
                <h3>No Complaints Yet</h3>
                <p>You have not submitted any cleanliness report.</p>
            </div>
        `;
        return;
    }

    complaintsList.innerHTML = "";

    reports.forEach(function(report, index) {

        complaintsList.innerHTML += `
            <div class="complaint-card">

                <div class="complaint-top">
                    <h3>Report #${index + 1}</h3>
                    <span class="complaint-status ${report.status.toLowerCase().replace(" ", "-")}">
                        ${report.status}
                    </span>
                </div>

                <p>
                    <strong>📍 Location:</strong>
                    ${report.location}
                </p>

                <p>
                    <strong>📝 Problem:</strong>
                    ${report.description}
                </p>

                <p>
                    <strong>🕐 Submitted:</strong>
                    ${report.date}
                </p>

            </div>
        `;
    });
}


if (document.getElementById("complaintsList")) {
    loadMyComplaints();
}
function loadComplaintStatus() {

    let reports = JSON.parse(localStorage.getItem("report")) || [];

    const statusList = document.getElementById("statusList");

    if (!statusList) {
        return;
    }

    if (reports.length === 0) {
        statusList.innerHTML = `
            <div class="no-status">
                <h3>No Complaints Found</h3>
                <p>Submit a cleanliness report to track its progress.</p>
            </div>
        `;
        return;
    }

    statusList.innerHTML = "";

    reports.forEach(function(report, index) {

        let submitted = true;
        let assigned = report.assignedStaff||
                       report.status === "In Progress" ||
                       report.status === "Verification Pending" ||
                       report.status === "Resolved";
        let verification = report.status === "Verification Pending" ||
                           report.status === "Resolved";
        let resolved = report.status === "Resolved";

        statusList.innerHTML += `
            <div class="status-card">

                <div class="status-header">
                    <h3>Report #${index + 1}</h3>
                    <span class="status-badge">
                        ${report.status}
                    </span>
                </div>

                <p><strong>Problem:</strong> ${report.description}</p>

                <p><strong>Location:</strong> ${report.location}</p>

                <div class="progress">

                    <div class="progress-step ${submitted ? "active" : ""}">
                        <span>✓</span>
                        <p>Report Submitted</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${assigned ? "active" : ""}">
                        <span>${assigned ? "✓" : "○"}</span>
                        <p>Staff Assigned</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${cleaning ? "active" : ""}">
                        <span>${cleaning ? "✓" : "○"}</span>
                        <p>Cleaning</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${verification ? "active" : ""}">
                        <span>${verification ? "✓" : "○"}</span>
                        <p>AI Verification</p>
                    </div>

                    <div class="progress-line"></div>

                    <div class="progress-step ${resolved ? "active" : ""}">
                        <span>${resolved ? "✓" : "○"}</span>
                        <p>Resolved</p>
                    </div>

                </div>

            </div>
        `;
    });
}


if (document.getElementById("statusList")) {
    loadComplaintStatus();
}