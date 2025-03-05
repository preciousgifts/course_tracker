document.addEventListener('DOMContentLoaded', () => {
    const addCourseBtn = document.getElementById('add-course-btn');
    const modal = document.getElementById('add-course-modal');
    const closeBtn = document.querySelector('.close-btn');
    const courseForm = document.getElementById('course-form');
    const courseList = document.getElementById('course-list');
    const statusFilter = document.getElementById('status-filter');
  
    // Show modal
    addCourseBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  
    // Hide modal
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    // Handle form submission
    courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const courseName = document.getElementById('course-name').value;
      const courseDescription = document.getElementById('course-description').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
  
      const newCourse = {
        name: courseName,
        description: courseDescription,
        start_date: startDate,
        end_date: endDate,
      };
  
      fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          modal.style.display = 'none';
          loadCourses(); // Refresh the course list
        })
        .catch(error => console.error('Error adding course:', error));
    });
  
    // Load courses from the backend
    function loadCourses() {
      const status = statusFilter.value;
      fetch(`/api/courses?status=${status}`)
        .then(response => response.json())
        .then(data => {
          courseList.innerHTML = '';
          data.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
              <h3>${course.name}</h3>
              <p>${course.description || 'No description'}</p>
              <p><strong>Start Date:</strong> ${course.start_date}</p>
              <p><strong>End Date:</strong> ${course.end_date || 'Ongoing'}</p>
              <p><strong>Status:</strong> ${course.status}</p>
              <div class="progress-bar">
                <div class="progress" style="width: ${course.progress || 0}%;"></div>
              </div>
              <button onclick="editCourse(${course.id})">Edit</button>
              <button onclick="deleteCourse(${course.id})">Delete</button>
            `;
            courseList.appendChild(card);
          });
        })
        .catch(error => console.error('Error fetching courses:', error));
    }
  
    // Filter courses by status
    statusFilter.addEventListener('change', () => {
      loadCourses();
    });
  
    // Edit a course
    window.editCourse = (id) => {
      const newName = prompt('Enter new course name:');
      const newDescription = prompt('Enter new course description:');
      const newProgress = prompt('Enter new progress (0-100):');
      if (newName && newProgress) {
        fetch(`/api/courses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newName,
            description: newDescription,
            progress: newProgress,
          }),
        })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
            loadCourses(); // Refresh the course list
          })
          .catch(error => console.error('Error updating course:', error));
      }
    };
  
    // Delete a course
    window.deleteCourse = (id) => {
      if (confirm('Are you sure you want to delete this course?')) {
        fetch(`/api/courses/${id}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
            loadCourses(); // Refresh the course list
          })
          .catch(error => console.error('Error deleting course:', error));
      }
    };
  
    // Initial load
    loadCourses();
  });