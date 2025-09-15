// Smart Study Planner - Main JavaScript functionality

class StudyPlanner {
    constructor() {
        this.goals = [];
        this.activeTab = 'dashboard';
        this.init();
    }

    init() {
        this.loadGoals();
        this.bindEvents();
        this.render();
        this.setMinDate();
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('goalDeadline').min = today;
    }

    bindEvents() {
        // Add goal button
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.showAddForm();
        });

        // Cancel form buttons
        document.getElementById('cancelFormBtn').addEventListener('click', () => {
            this.hideAddForm();
        });
        document.getElementById('cancelFormBtn2').addEventListener('click', () => {
            this.hideAddForm();
        });

        // Form submission
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    }

    loadGoals() {
        this.goals = window.StorageAPI.loadGoalsFromStorage();
    }

    saveGoals() {
        window.StorageAPI.saveGoalsToStorage(this.goals);
    }

    showAddForm() {
        document.getElementById('addGoalForm').classList.remove('hidden');
        document.getElementById('addGoalBtn').style.display = 'none';
    }

    hideAddForm() {
        document.getElementById('addGoalForm').classList.add('hidden');
        document.getElementById('addGoalBtn').style.display = 'flex';
        document.getElementById('goalForm').reset();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const goalData = {
            title: document.getElementById('goalTitle').value,
            subject: document.getElementById('goalSubject').value,
            description: document.getElementById('goalDescription').value,
            deadline: document.getElementById('goalDeadline').value,
            priority: document.getElementById('goalPriority').value,
            progress: 0,
            completed: false
        };

        if (!goalData.title || !goalData.subject || !goalData.deadline) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }

        const newGoal = {
            ...goalData,
            id: window.StorageAPI.generateId(),
            createdAt: new Date().toISOString()
        };

        this.goals.unshift(newGoal);
        this.saveGoals();
        this.hideAddForm();
        this.render();
        this.showToast('Goal Added', 'Your new study goal has been created successfully!', 'success');
    }

    toggleGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            goal.progress = goal.completed ? 100 : goal.progress;
            this.saveGoals();
            this.render();
            this.showToast(
                goal.completed ? 'Goal Completed' : 'Goal Reopened',
                goal.completed ? 'Congratulations on your achievement!' : 'Keep working on it!',
                'success'
            );
        }
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveGoals();
        this.render();
        this.showToast('Goal Deleted', 'The study goal has been removed.', 'error');
    }

    editGoal(id) {
        this.showToast('Edit Feature', 'Click on a goal\'s progress to update it, or recreate with new details.', 'success');
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.activeTab = tabName;
    }

    render() {
        this.renderDashboard();
        this.renderActiveGoals();
        this.renderCompletedGoals();
    }

    renderDashboard() {
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const totalGoals = this.goals.length;
        const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        
        const overdueTasks = this.goals.filter(goal => 
            !goal.completed && new Date(goal.deadline) < new Date()
        ).length;
        
        const upcomingTasks = this.goals.filter(goal => {
            const deadline = new Date(goal.deadline);
            const today = new Date();
            const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
            return !goal.completed && deadline >= today && deadline <= threeDaysFromNow;
        }).length;

        const stats = [
            {
                title: 'Total Goals',
                value: totalGoals,
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>`,
                iconClass: 'primary'
            },
            {
                title: 'Completion Rate',
                value: `${completionRate}%`,
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>`,
                iconClass: 'success'
            },
            {
                title: 'Due Soon',
                value: upcomingTasks,
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>`,
                iconClass: 'warning'
            },
            {
                title: 'Overdue',
                value: overdueTasks,
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>`,
                iconClass: 'destructive'
            }
        ];

        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-content">
                    <div class="stat-info">
                        <h3>${stat.title}</h3>
                        <p>${stat.value}</p>
                    </div>
                    <div class="stat-icon ${stat.iconClass}">
                        ${stat.icon}
                    </div>
                </div>
            </div>
        `).join('');

        // Overview card
        const averageProgress = totalGoals > 0 
            ? Math.round(this.goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
            : 0;

        const overviewCard = document.getElementById('overviewCard');
        if (totalGoals > 0) {
            overviewCard.classList.remove('hidden');
            document.getElementById('averageProgress').textContent = `${averageProgress}%`;
            document.getElementById('overviewProgressFill').style.width = `${averageProgress}%`;
            document.getElementById('completedCount').textContent = `${completedGoals} completed`;
            document.getElementById('remainingCount').textContent = `${totalGoals - completedGoals} remaining`;
        } else {
            overviewCard.classList.add('hidden');
        }
    }

    renderActiveGoals() {
        const activeGoals = this.goals.filter(goal => !goal.completed);
        const activeGoalsList = document.getElementById('activeGoalsList');
        const noActiveGoals = document.getElementById('noActiveGoals');
        const activeCount = document.getElementById('activeCount');
        
        activeCount.textContent = `${activeGoals.length} goals`;

        if (activeGoals.length === 0) {
            activeGoalsList.innerHTML = '';
            noActiveGoals.classList.remove('hidden');
        } else {
            noActiveGoals.classList.add('hidden');
            activeGoalsList.innerHTML = activeGoals.map(goal => this.renderGoalCard(goal)).join('');
        }
    }

    renderCompletedGoals() {
        const completedGoals = this.goals.filter(goal => goal.completed);
        const completedGoalsList = document.getElementById('completedGoalsList');
        const noCompletedGoals = document.getElementById('noCompletedGoals');
        const completedCount = document.getElementById('completedGoalsCount');
        
        completedCount.textContent = `${completedGoals.length} goals`;

        if (completedGoals.length === 0) {
            completedGoalsList.innerHTML = '';
            noCompletedGoals.classList.remove('hidden');
        } else {
            noCompletedGoals.classList.add('hidden');
            completedGoalsList.innerHTML = completedGoals.map(goal => this.renderGoalCard(goal)).join('');
        }
    }

    renderGoalCard(goal) {
        const daysUntilDeadline = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        let deadlineClass = '';
        let deadlineText = '';
        
        if (daysUntilDeadline < 0) {
            deadlineClass = 'overdue';
            deadlineText = `${Math.abs(daysUntilDeadline)} days overdue`;
        } else if (daysUntilDeadline === 0) {
            deadlineClass = 'due-soon';
            deadlineText = 'Due today';
        } else if (daysUntilDeadline <= 3) {
            deadlineClass = 'due-soon';
            deadlineText = `${daysUntilDeadline} days left`;
        } else {
            deadlineText = `${daysUntilDeadline} days left`;
        }

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-info">
                        <button class="goal-checkbox ${goal.completed ? 'completed' : ''}" onclick="planner.toggleGoal('${goal.id}')">
                            ${goal.completed ? 
                                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' : 
                                ''
                            }
                        </button>
                        <div class="goal-details">
                            <h3 class="${goal.completed ? 'completed' : ''}">${goal.title}</h3>
                            <p>${goal.subject}</p>
                        </div>
                    </div>
                    <div class="goal-actions">
                        <span class="badge ${goal.priority}">${goal.priority}</span>
                        <button class="btn-icon" onclick="planner.editGoal('${goal.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="planner.deleteGoal('${goal.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-progress">
                    <div class="goal-progress-header">
                        <span>Progress</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                <div class="goal-footer">
                    <div class="goal-footer-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>${new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div class="goal-footer-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <span class="${deadlineClass}">${deadlineText}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showToast(title, message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        document.getElementById('toastContainer').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}

// Global function to show add form (used by empty state button)
function showAddForm() {
    window.planner.showAddForm();
}

// Initialize the planner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.planner = new StudyPlanner();
});