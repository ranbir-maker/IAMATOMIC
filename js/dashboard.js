document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  // Enforce dark theme
  document.documentElement.setAttribute('data-theme', 'dark');

  if (Auth.isLoggedIn()) {
    showDashboard();
  } else {
    showAuth();
  }

  function showAuth() {
    $('authSection').style.display = 'flex';
    $('dashboardSection').style.display = 'none';
    $('logoutBtn').style.display = 'none';
    $('viewPortfolioBtn').style.display = 'none';

    const loginForm = $('loginForm');
    const feedback = $('loginFeedback');

    if (loginForm) {
      loginForm.style.display = 'flex';
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = $('loginUsername').value;
        const password = $('loginPassword').value;

        const res = Auth.login(username, password);
        feedback.textContent = res.message;
        feedback.className = `auth-feedback ${res.success ? 'success' : 'error'}`;

        if (res.success) {
          setTimeout(showDashboard, 500);
        }
      });
    }
  }

  function showDashboard() {
    $('authSection').style.display = 'none';
    $('dashboardSection').style.display = 'block';
    $('logoutBtn').style.display = 'inline-flex';
    $('viewPortfolioBtn').style.display = 'inline-flex';

    const userData = Auth.getCurrentUserData();
    if (!userData) return;

    $('dashUserName').textContent = userData.displayName || 'User';

    initTabs();
    loadProfileForm(userData);
    loadSkillsEditor(userData);
    loadProjectsEditor(userData);
    initExportImport();

    $('logoutBtn').addEventListener('click', () => {
      Auth.logout();
      window.location.reload();
    });
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.dash-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        const panel = $(`panel-${tab.dataset.tab}`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  function loadProfileForm(userData) {
    const profile = userData.profile || {};
    const setVal = (id, val) => {
      const el = $(id);
      if (el) el.value = val || '';
    };

    setVal('profName', profile.name);
    setVal('profRole', profile.role);
    setVal('profBio', profile.bio);
    setVal('profAbout', profile.about);
    setVal('profEmail', profile.email);
    setVal('profLocation', profile.location);
    setVal('profGithub', profile.github);
    setVal('profLinkedin', profile.linkedin);
    setVal('profTwitter', profile.twitter);

    if (profile.stats && profile.stats.length >= 2) {
      setVal('stat1Num', profile.stats[0].number);
      setVal('stat1Label', profile.stats[0].label);
      setVal('stat2Num', profile.stats[1].number);
      setVal('stat2Label', profile.stats[1].label);
    }

    $('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const getVal = (id) => {
        const el = $(id);
        return el ? el.value.trim() : '';
      };

      Auth.updateProfile({
        name: getVal('profName'),
        role: getVal('profRole'),
        bio: getVal('profBio'),
        about: getVal('profAbout'),
        email: getVal('profEmail'),
        location: getVal('profLocation'),
        github: getVal('profGithub'),
        linkedin: getVal('profLinkedin'),
        twitter: getVal('profTwitter'),
        stats: [
          { number: getVal('stat1Num') || '0', label: getVal('stat1Label') || 'Projects' },
          { number: getVal('stat2Num') || '0', label: getVal('stat2Label') || 'Years' }
        ]
      });

      flashFeedback('profileSaved');
    });
  }

  function loadSkillsEditor(userData) {
    const container = $('skillGroupsContainer');
    container.innerHTML = '';
    (userData.skills || []).forEach(group => addSkillGroup(container, group));

    $('addSkillGroupBtn').onclick = () => addSkillGroup(container);

    $('saveSkillsBtn').onclick = () => {
      const groups = [];
      container.querySelectorAll('.skill-group-editor').forEach(editor => {
        const groupName = editor.querySelector('.sg-name').value.trim();
        const tags = editor.querySelector('.sg-tags').value.trim();
        if (groupName) groups.push({ groupName, tags });
      });

      Auth.updateSkills(groups);
      flashFeedback('skillsSaved');
    };
  }

  function addSkillGroup(container, data = {}) {
    const div = document.createElement('div');
    div.className = 'skill-group-editor';
    div.innerHTML = `
      <button type="button" class="remove-group-btn" title="Remove group">&times;</button>
      <div class="form-group">
        <label>Group Name (e.g., Frontend, Backend)</label>
        <input type="text" class="sg-name" placeholder="Frontend" maxlength="50" value="${escapeHtml(data.groupName || '')}">
      </div>
      <div class="form-group">
        <label>Skills (comma-separated)</label>
        <input type="text" class="sg-tags" placeholder="HTML, CSS, JavaScript, React" maxlength="500" value="${escapeHtml(data.tags || '')}">
      </div>
    `;
    div.querySelector('.remove-group-btn').onclick = () => div.remove();
    container.appendChild(div);
  }

  function loadProjectsEditor(userData) {
    const container = $('projectItemsContainer');
    container.innerHTML = '';
    (userData.projects || []).forEach(proj => addProject(container, proj));

    $('addProjectBtn').onclick = () => addProject(container);

    $('saveProjectsBtn').onclick = () => {
      const items = [];
      container.querySelectorAll('.project-item-editor').forEach(editor => {
        const title = editor.querySelector('.pj-title').value.trim();
        if (title) {
          items.push({
            title,
            description: editor.querySelector('.pj-desc').value.trim(),
            category: editor.querySelector('.pj-category').value,
            tags: editor.querySelector('.pj-tags').value.trim(),
            liveUrl: editor.querySelector('.pj-live').value.trim(),
            sourceUrl: editor.querySelector('.pj-source').value.trim()
          });
        }
      });

      Auth.updateProjects(items);
      flashFeedback('projectsSaved');
    };
  }

  function addProject(container, data = {}) {
    const div = document.createElement('div');
    div.className = 'project-item-editor';
    const cat = data.category || 'web-app';

    div.innerHTML = `
      <button type="button" class="remove-project-btn" title="Remove project">&times;</button>
      <div class="form-row">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="pj-title" placeholder="My Awesome App" maxlength="100" value="${escapeHtml(data.title || '')}">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select class="pj-category">
            <option value="web-app"${cat === 'web-app' ? ' selected' : ''}>Web App</option>
            <option value="ui-ux"${cat === 'ui-ux' ? ' selected' : ''}>UI / UX</option>
            <option value="tool"${cat === 'tool' ? ' selected' : ''}>Tool</option>
            <option value="mobile"${cat === 'mobile' ? ' selected' : ''}>Mobile</option>
            <option value="other"${cat === 'other' ? ' selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="pj-desc" rows="2" placeholder="A short description of the project..." maxlength="500">${escapeHtml(data.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Tech Tags (comma-separated)</label>
        <input type="text" class="pj-tags" placeholder="React, Node.js, MongoDB" maxlength="300" value="${escapeHtml(data.tags || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Live Demo URL</label>
          <input type="url" class="pj-live" placeholder="https://myapp.vercel.app" maxlength="300" value="${escapeHtml(data.liveUrl || '')}">
        </div>
        <div class="form-group">
          <label>Source Code URL</label>
          <input type="url" class="pj-source" placeholder="https://github.com/you/repo" maxlength="300" value="${escapeHtml(data.sourceUrl || '')}">
        </div>
      </div>
    `;

    const select = div.querySelector('select');
    if (select) {
      select.style.padding = '12px 16px';
      select.style.background = 'var(--bg-input)';
      select.style.border = '1px solid var(--border)';
      select.style.borderRadius = 'var(--radius-sm)';
      select.style.color = 'var(--text-primary)';
      select.style.fontSize = 'inherit';
      select.style.fontFamily = 'inherit';
      select.style.minHeight = '44px';
      select.style.cursor = 'pointer';
    }

    div.querySelector('.remove-project-btn').onclick = () => div.remove();
    container.appendChild(div);
  }

  function initExportImport() {
    $('exportBtn').addEventListener('click', () => {
      const data = Auth.exportUserData();
      if (!data) return;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iamatomic-portfolio-${Auth.getCurrentUsername() || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    $('importFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const feedback = $('importFeedback');
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = Auth.importUserData(event.target.result);
        feedback.textContent = res.message;
        feedback.className = 'save-feedback show';
        feedback.style.color = res.success ? 'var(--green)' : 'var(--red)';

        if (res.success) {
          setTimeout(() => window.location.reload(), 1000);
        }
      };
      reader.readAsText(file);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function flashFeedback(id) {
    const el = $(id);
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
});
