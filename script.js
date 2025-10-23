class CuisineSelector {
    constructor() {
        this.currentStep = 1;
        this.allResponses = JSON.parse(localStorage.getItem('cuisineResponses') || '[]');
        this.userData = {
            initialChoice: null,
            day: null,
            cuisine: null,
            timestamp: null
        };
        this.setupLoginHandlers();
    }

    setupLoginHandlers() {
        // Get login elements
        const loginTrigger = document.getElementById('loginTrigger');
        const loginModal = document.getElementById('loginModal');
        const closeButtons = document.querySelectorAll('.close-btn');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        // Admin credentials
        const ADMIN_CREDENTIALS = {
            id: 'QHuyBA',
            password: 'Huy0603'
        };

        // Show login modal
        loginTrigger.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });

        // Close modals
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.classList.add('hidden');
                document.getElementById('adminView').classList.add('hidden');
            });
        });

        // Handle login
        loginBtn.addEventListener('click', () => {
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;

            if (userId === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
                loginModal.classList.add('hidden');
                document.getElementById('adminView').classList.remove('hidden');
                this.updateAdminView();
            } else {
                alert('Invalid credentials!');
            }
        });

        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                document.getElementById('adminView').classList.add('hidden');
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }

    updateAdminView() {
        const totalResponses = this.allResponses.length;
        document.getElementById('totalResponses').textContent = totalResponses;

        // Calculate most popular day
        const days = this.allResponses.map(r => r.day);
        const popularDay = this.getMostPopular(days);
        document.getElementById('popularDay').textContent = popularDay || '-';

        // Calculate most popular cuisine
        const cuisines = this.allResponses.map(r => r.cuisine);
        const popularCuisine = this.getMostPopular(cuisines);
        document.getElementById('popularCuisine').textContent = popularCuisine || '-';

        // Display all responses
        this.displayResponses();
    }

    getMostPopular(array) {
        if (!array.length) return null;
        return array.sort((a,b) =>
            array.filter(v => v === a).length - array.filter(v => v === b).length
        ).pop();
    }

    displayResponses() {
        const responsesList = document.getElementById('responsesList');
        responsesList.innerHTML = '';
        
        this.allResponses.forEach(response => {
            const responseItem = document.createElement('div');
            responseItem.className = 'response-item';
            responseItem.innerHTML = `
                <p>Day: ${response.day}</p>
                <p>Cuisine: ${response.cuisine}</p>
                <p class="timestamp">Time: ${new Date(response.timestamp).toLocaleString()}</p>
            `;
            responsesList.appendChild(responseItem);
        });
    }

    async init() {
        await this.loadResponses();
        this.bindEvents();
    }

    async loadResponses() {
        try {
            const response = await fetch('/api/responses');
            if (!response.ok) {
                throw new Error('Failed to load responses');
            }
            this.allResponses = await response.json();
        } catch (error) {
            console.error('Error loading responses:', error);
            this.allResponses = [];
            this.showMessage('Error loading responses. Please try again later.');
        }
    }

    bindEvents() {
        // Step 1 buttons
        document.getElementById('btn1').addEventListener('click', () => this.handleInitialChoice('yes'));
        document.getElementById('btn2').addEventListener('click', () => this.handleInitialChoice('no'));
        
        // Button 2 avoidance behavior
        const btn2 = document.getElementById('btn2');
        btn2.addEventListener('mouseenter', () => this.avoidButton(btn2));
        
        // Step 2 buttons
        document.querySelectorAll('.btn-choice').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDayChoice(e.target.dataset.choice));
        });
        
        // Step 3 buttons
        document.querySelectorAll('.btn-cuisine').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCuisineChoice(e.target.dataset.cuisine));
        });
        
        // Data monitor
        document.getElementById('view-data').addEventListener('click', () => this.showDataModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideDataModal());
        
        // Close modal on outside click
        document.getElementById('dataModal').addEventListener('click', (e) => {
            if (e.target.id === 'dataModal') this.hideDataModal();
        });
    }

    avoidButton(button) {
        button.classList.add('btn-avoiding');
        setTimeout(() => {
            button.classList.remove('btn-avoiding');
        }, 500);
    }

    handleInitialChoice(choice) {
        this.userData.initialChoice = choice;
        if (choice === 'yes') {
            this.nextStep();
        } else {
            // Show a funny message and still proceed
            this.showMessage("Haha, nice try! But we're still having dinner! 😄");
            setTimeout(() => this.nextStep(), 2000);
        }
    }

    handleDayChoice(day) {
        this.userData.day = day;
        this.nextStep();
    }

    handleCuisineChoice(cuisine) {
        this.userData.cuisine = cuisine;
        this.userData.timestamp = new Date().toISOString();
        this.saveResponse();
        this.showSummary();
        this.nextStep();
    }

    nextStep() {
        const currentStepEl = document.getElementById(`step${this.currentStep}`);
        const nextStepEl = document.getElementById(`step${this.currentStep + 1}`);
        
        if (currentStepEl && nextStepEl) {
            currentStepEl.classList.add('hidden');
            nextStepEl.classList.remove('hidden');
            this.currentStep++;
        }
    }

    showSummary() {
        const summaryContent = document.getElementById('summary-content');
        summaryContent.innerHTML = `
            <strong>Initial Choice:</strong> ${this.userData.initialChoice === 'yes' ? 'Wants dinner with Mr. Huy' : 'Doesn\'t like him (but still proceeding!)'}<br>
            <strong>Day:</strong> ${this.userData.day}<br>
            <strong>Cuisine:</strong> ${this.userData.cuisine}<br>
            <strong>Time:</strong> ${new Date(this.userData.timestamp).toLocaleString()}
        `;
    }

    async saveResponse() {
        try {
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update the local responses with the full dataset from server
                this.allResponses = result.data;
                this.updateStats();
                this.displayAllResponses();
            } else {
                throw new Error('Failed to save response');
            }
        } catch (error) {
            console.error('Error saving response:', error);
            this.showMessage('Error saving your response. Please try again.');
        }
    }

    showDataModal() {
        document.getElementById('dataModal').classList.remove('hidden');
        this.displayAllResponses();
    }

    hideDataModal() {
        document.getElementById('dataModal').classList.add('hidden');
    }

    updateStats() {
        const totalResponses = this.allResponses.length;
        document.getElementById('totalResponses').textContent = totalResponses;
        
        if (totalResponses > 0) {
            // Most popular day
            const dayCounts = {};
            this.allResponses.forEach(response => {
                dayCounts[response.day] = (dayCounts[response.day] || 0) + 1;
            });
            const popularDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, 'None');
            document.getElementById('popularDay').textContent = popularDay;
            
            // Most popular cuisine
            const cuisineCounts = {};
            this.allResponses.forEach(response => {
                cuisineCounts[response.cuisine] = (cuisineCounts[response.cuisine] || 0) + 1;
            });
            const popularCuisine = Object.keys(cuisineCounts).reduce((a, b) => cuisineCounts[a] > cuisineCounts[b] ? a : b, 'None');
            document.getElementById('popularCuisine').textContent = popularCuisine;
        }
    }

    displayAllResponses() {
        const responsesList = document.getElementById('responsesList');
        if (!responsesList) return;

        responsesList.innerHTML = '';
        this.allResponses.forEach(response => {
            const responseItem = document.createElement('div');
            responseItem.className = 'response-item';
            responseItem.innerHTML = `
                <p>Day: ${response.day}</p>
                <p>Cuisine: ${response.cuisine}</p>
                <p class="timestamp">Time: ${new Date(response.timestamp).toLocaleString()}</p>
            `;
            responsesList.appendChild(responseItem);
        });
    }

    showMessage(message) {
        // Create a temporary message overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            font-family: 'Poppins', sans-serif;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            font-size: 1.2rem;
            color: #333;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            margin: 20px;
        `;
        messageEl.textContent = message;
        
        overlay.appendChild(messageEl);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CuisineSelector();
    app.init();
});

// Add some fun animations
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        setTimeout(() => {
            btn.style.transition = 'all 0.5s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('dataModal');
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('btn-secondary')) {
        e.target.classList.add('btn-avoiding');
        setTimeout(() => {
            e.target.classList.remove('btn-avoiding');
        }, 500);
    }
});
