class CuisineSelector {
    constructor() {
        this.currentStep = 1;
        this.userData = {
            initialChoice: null,
            day: null,
            cuisine: null,
            timestamp: null
        };
        this.allResponses = [];
        this.githubConfig = {
            owner: config.GITHUB_USERNAME,
            repo: config.GITHUB_REPO,
            path: config.RESPONSES_PATH,
            token: config.GITHUB_TOKEN
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

        // Add auto-refresh for admin view
        let refreshInterval;
        
        // Handle login
        loginBtn.addEventListener('click', async () => {
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;

            if (userId === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
                loginModal.classList.add('hidden');
                document.getElementById('adminView').classList.remove('hidden');
                await this.loadResponses(); // Reload data when opening admin view
                
                // Set up auto-refresh every 30 seconds
                refreshInterval = setInterval(() => this.loadResponses(), 30000);
            } else {
                alert('Invalid credentials!');
            }
        });

        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                document.getElementById('adminView').classList.add('hidden');
                clearInterval(refreshInterval);
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
        try {
            await this.loadResponses();
            this.bindEvents();
            console.log('Initialization complete');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    async loadResponses() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${this.githubConfig.path}`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load responses');
            }

            const data = await response.json();
            const content = atob(data.content);
            this.allResponses = JSON.parse(content);
            this.updateStats();
            this.displayAllResponses();
            
            // Store SHA for future updates
            this.currentSHA = data.sha;
            
            return this.allResponses;
        } catch (error) {
            console.error('Error loading responses:', error);
            this.allResponses = [];
            return [];
        }
    }

    async saveResponse() {
        try {
            // Create new response object
            const newResponse = {
                ...this.userData,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // Try to get existing file first
            let existingData = [];
            let sha = '';

            try {
                const getResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${this.githubConfig.path}`, {
                    headers: {
                        'Authorization': `token ${this.githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    existingData = JSON.parse(atob(fileData.content));
                    sha = fileData.sha;
                }
            } catch (error) {
                console.log('No existing file found, creating new one');
            }

            // Add new response to existing data
            existingData.push(newResponse);

            // Save to GitHub
            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${this.githubConfig.path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: 'Update survey responses',
                    content: btoa(JSON.stringify(existingData, null, 2)),
                    sha: sha // Include SHA if updating existing file
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to save response: ${response.statusText}`);
            }

            // Update local data
            this.allResponses = existingData;
            this.updateStats();
            this.displayAllResponses();
            this.showMessage('Response saved successfully!');
            
            console.log('Response saved successfully:', newResponse);
            
        } catch (error) {
            console.error('Error saving response:', error);
            this.showMessage('Error saving your response. Please try again.');
        }
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Step 1 buttons
        const btn1 = document.getElementById('btn1');
        const btn2 = document.getElementById('btn2');
        
        console.log('Found buttons:', { btn1, btn2 });
        
        if (btn1) btn1.addEventListener('click', () => this.handleInitialChoice('yes'));
        if (btn2) btn2.addEventListener('click', () => this.handleInitialChoice('no'));
        
        // Button 2 avoidance behavior
        if (btn2) {
            btn2.addEventListener('mouseenter', () => this.avoidButton(btn2));
        }
        
        // Step 2 buttons - Day Selection
        const dayButtons = document.querySelectorAll('[data-choice]');
        dayButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.target.getAttribute('data-choice');
                this.handleDayChoice(choice);
            });
        });
        
        // Step 3 buttons - Cuisine Selection
        const cuisineButtons = document.querySelectorAll('[data-cuisine]');
        cuisineButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cuisine = e.target.getAttribute('data-cuisine');
                this.handleCuisineChoice(cuisine);
            });
        });
        
        // View data button
        const viewDataBtn = document.getElementById('view-data');
        if (viewDataBtn) {
            viewDataBtn.addEventListener('click', () => {
                document.getElementById('adminView').classList.remove('hidden');
                this.displayAllResponses();
            });
        }

        console.log('Events bound successfully');
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
        console.log('Handling cuisine choice:', cuisine);
        this.userData.cuisine = cuisine;
        this.userData.timestamp = new Date().toISOString();
        console.log('User data before saving:', this.userData);
        this.saveResponse().then(() => {
            console.log('Save response completed');
            this.showSummary();
            this.nextStep();
        }).catch(error => {
            console.error('Error in handleCuisineChoice:', error);
        });
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

    showDataModal() {
        const adminView = document.getElementById('adminView');
        if (adminView) {
            adminView.classList.remove('hidden');
            this.displayAllResponses();
        }
    }

    hideDataModal() {
        const adminView = document.getElementById('adminView');
        if (adminView) {
            adminView.classList.add('hidden');
        }
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
        
        // Sort responses by timestamp, newest first
        const sortedResponses = [...this.allResponses].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedResponses.forEach(response => {
            const responseItem = document.createElement('div');
            responseItem.className = 'response-item';
            responseItem.innerHTML = `
                <p><strong>Choice:</strong> ${response.initialChoice === 'yes' ? 'Wants dinner' : 'Doesn\'t want dinner'}</p>
                <p><strong>Day:</strong> ${response.day}</p>
                <p><strong>Cuisine:</strong> ${response.cuisine}</p>
                <p class="timestamp"><strong>Time:</strong> ${new Date(response.timestamp).toLocaleString()}</p>
                <p class="user-agent"><small>Device: ${response.userAgent ? response.userAgent.split(')')[0] + ')' : 'Unknown'}</small></p>
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
    try {
        console.log('DOM loaded, initializing app...');
        const app = new CuisineSelector();
        console.log('CuisineSelector created');
        app.init();
        console.log('App initialized');
    } catch (error) {
        console.error('Error creating app:', error);
    }
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
