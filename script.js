const adminID1 = "123848";
const adminPassword1 = "nitin";
const adminID2 = "123745";
const adminPassword2 = "deepali";
const adminID3 = "115044";
const adminPassword3 = "mobashir";
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
    if(id===adminID3 && password===adminPassword3){
        window.location.href = "admin-dashboard.html";
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

    let report = JSON.parse(localStorage.getItem("report")) || [];

    report.push({
        location: location,
        description: description,
        status: "Pending",
        date: new Date().toLocaleString()
    });

    localStorage.setItem("report", JSON.stringify(report));

    alert("Report Submitted Successfully!");

    window.location.href = "student-dashboard.html";
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
        let button="";
        if(report.status==="Pending"){
            button=`<button class="resolve-button" onclick="resolveReport(${index})"> Mark as Resolved</button> `;
        }
        
        reportsList.innerHTML += `
            <div class="admin-report-card">
                <h3>Report #${index + 1}</h3>
                <p><strong>Location:</strong> ${report.location}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Status:</strong> ${report.status}</p>
                <p><strong>Date:</strong> ${report.date}</p>
                ${button}
            </div>
        `;
    });
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

    let resolved = reports.filter(function(report) {
        return report.status === "Resolved";
    }).length;

    document.getElementById("totalReports").textContent = total;
    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("resolvedReports").textContent = resolved;
}
if(document.getElementById("totalReports")){
    updateAdminStats();
}