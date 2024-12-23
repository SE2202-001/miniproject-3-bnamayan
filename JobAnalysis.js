// Creating a job class to store info
class Job {
    constructor(data) {
        this.title = data["Title"] || 'No Title';
        this.posted = data["Posted"] || 'Unknown';
        this.type = data["Type"] || 'Unknown';
        this.level = data["Level"] || 'Unknown';
        this.skill = data["Skill"] || 'Unknown';
        this.detail = data["Detail"] || 'No Details';
    }

    // Get posted minutes so I can sort
    getPostedMinutes() {
        const timeStr = this.posted.toLowerCase();
        const [value, unit1, unit2] = timeStr.split(' ');
        let minutes = parseInt(value);
        let unit = unit1;

        // Handle cases like "6 months ago"
        if (unit2 && unit2.startsWith('month')) {
            unit = `${unit1} ${unit2}`;
        }

        if (unit.startsWith('minute')) {
            // nothing has to be done
        } else if (unit.startsWith('hour')) {
            minutes *= 60;
        } else if (unit.startsWith('day')) {
            minutes *= 60 * 24;
        } else if (unit.startsWith('week')) {
            minutes *= 60 * 24 * 7;
        } else if (unit.startsWith('month')) {
            minutes *= 60 * 24 * 30;
        } else {
            // If unit is unknown, default to a large number
            minutes = Number.MAX_SAFE_INTEGER;
        }
        return minutes;
    }
}

// Global variables to store jobs
let jobs = [];
let filteredJobs = [];

// Listen for file upload
document.getElementById('fileUpload').addEventListener('change', loadJSON);

// parse given json
function loadJSON(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            jobs = data.map(item => new Job(item));
            filteredJobs = jobs.slice();
            generateFilters();
            displayJobs(filteredJobs);
            document.getElementById('controls').style.display = 'block';
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Create the filters base on user input
function generateFilters() {
    const levelSet = new Set();
    const typeSet = new Set();
    const skillSet = new Set();

    jobs.forEach(job => {
        levelSet.add(job.level);
        typeSet.add(job.type);
        skillSet.add(job.skill);
    });

    populateFilter('levelFilter', levelSet);
    populateFilter('typeFilter', typeSet);
    populateFilter('skillFilter', skillSet);

    // Add event listeners for filters
    document.getElementById('levelFilter').addEventListener('change', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('skillFilter').addEventListener('change', applyFilters);
    document.getElementById('sortOptions').addEventListener('change', applySorting);
}

// Populate filter dropdown
function populateFilter(elementId, optionsSet) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="All">All</option>';
    optionsSet.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

// Apply filters to all lsiting
function applyFilters() {
    const levelFilter = document.getElementById('levelFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;

    filteredJobs = jobs.filter(job => {
        return (levelFilter === 'All' || job.level === levelFilter) &&
            (typeFilter === 'All' || job.type === typeFilter) &&
            (skillFilter === 'All' || job.skill === skillFilter);
    });

    applySorting();
}

// Sorting
function applySorting() {
    const sortOption = document.getElementById('sortOptions').value;

    if (sortOption === 'titleAsc') {
        filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'titleDesc') {
        filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === 'timeAsc') {
        filteredJobs.sort((a, b) => a.getPostedMinutes() - b.getPostedMinutes());
    } else if (sortOption === 'timeDesc') {
        filteredJobs.sort((a, b) => b.getPostedMinutes() - a.getPostedMinutes());
    }

    displayJobs(filteredJobs);
}

// Display the jobs
function displayJobs(jobList) {
    const jobListDiv = document.getElementById('job-list');
    jobListDiv.innerHTML = '';

    if (jobList.length === 0) {
        jobListDiv.innerHTML = '<p>No jobs available.</p>';
        return;
    }

    // repeat for each job
    jobList.forEach((job) => {
        const jobItem = document.createElement('div');
        jobItem.className = 'job-item';
        jobItem.textContent = `${job.title} - Posted: ${job.posted}`;
        jobItem.addEventListener('click', () => showJobDetails(job));
        jobListDiv.appendChild(jobItem);
    });
}


// Make it come out the side when clicked
function showJobDetails(job) {
    const jobDetailsDiv = document.getElementById('job-details');
    const jobListDiv = document.getElementById('job-list');
    jobDetailsDiv.style.display = 'block';
    jobDetailsDiv.innerHTML = `
        <button class="close-button"
            onclick="document.getElementById('job-details').classList.remove('active'); document.getElementById('job-details').style.display='none'; document.getElementById('job-list').classList.remove('shifted');">&times;</button>
        <h2>${job.title}</h2>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Level:</strong> ${job.level}</p>
        <p><strong>Skill:</strong> ${job.skill}</p>
        <p><strong>Description:</strong> ${job.detail}</p>
        <p><strong>Posted:</strong> ${job.posted}</p>
    `;
    jobDetailsDiv.classList.add('active');
    jobListDiv.classList.add('shifted');
}