// Auth helper backed by localStorage
const Auth = (() => {
  const USERS_KEY = 'iamatomic_users';
  const SESSION_KEY = 'iamatomic_session';

  // Demo hash (not secure for real production, fine for client-side demo)
  function hashPassword(password) {
    let hash = 0;
    const salted = `iamatomic_salt_2026${password}iamatomic_salt_2026`;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function signup(username, password, displayName) {
    username = (username || '').trim().toLowerCase();
    displayName = (displayName || '').trim();

    if (!username || !password || !displayName) {
      return { success: false, message: 'All fields are required.' };
    }
    if (username.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return { success: false, message: 'Username can only have letters, numbers, and underscores.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const users = getUsers();
    if (users[username]) {
      return { success: false, message: 'This username is already taken.' };
    }

    users[username] = {
      passwordHash: hashPassword(password),
      displayName,
      createdAt: new Date().toISOString(),
      profile: {
        name: displayName,
        role: 'Developer',
        bio: '',
        about: '',
        email: '',
        location: '',
        github: '',
        linkedin: '',
        twitter: '',
        stats: [
          { number: '0', label: 'Projects Built' },
          { number: '0', label: 'Years Coding' }
        ]
      },
      skills: [],
      projects: []
    };

    saveUsers(users);
    createSession(username);
    return { success: true, message: 'Account created! Redirecting...' };
  }

  function login(username, password) {
    username = (username || '').trim().toLowerCase();
    if (!username || !password) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    const users = getUsers();
    const user = users[username];

    if (!user) {
      return { success: false, message: 'No account found with this username.' };
    }
    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, message: 'Incorrect password. Try again.' };
    }

    createSession(username);
    return { success: true, message: 'Login successful! Redirecting...' };
  }

  const createSession = (username) => localStorage.setItem(SESSION_KEY, username);
  const logout = () => localStorage.removeItem(SESSION_KEY);
  const getCurrentUsername = () => localStorage.getItem(SESSION_KEY) || null;
  const isLoggedIn = () => getCurrentUsername() !== null;

  function getCurrentUserData() {
    const user = getCurrentUsername();
    return user ? (getUsers()[user] || null) : null;
  }

  function updateUserData(updated) {
    const user = getCurrentUsername();
    if (!user) return false;
    const users = getUsers();
    if (!users[user]) return false;

    Object.assign(users[user], updated);
    saveUsers(users);
    return true;
  }

  const updateProfile = (profile) => updateUserData({ profile });
  const updateSkills = (skills) => updateUserData({ skills });
  const updateProjects = (projects) => updateUserData({ projects });

  function exportUserData() {
    const data = getCurrentUserData();
    if (!data) return null;

    const copy = JSON.parse(JSON.stringify(data));
    delete copy.passwordHash;
    copy._exportedAt = new Date().toISOString();
    copy._exportedBy = getCurrentUsername();
    return copy;
  }

  function importUserData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      const user = getCurrentUsername();
      if (!user) return { success: false, message: 'You must be logged in to import data.' };

      const users = getUsers();
      if (!users[user]) return { success: false, message: 'User not found.' };

      ['profile', 'skills', 'projects', 'displayName'].forEach(key => {
        if (data[key]) users[user][key] = data[key];
      });

      saveUsers(users);
      return { success: true, message: 'Data imported successfully!' };
    } catch {
      return { success: false, message: 'Invalid JSON file. Please try again.' };
    }
  }

  return {
    signup,
    login,
    logout,
    isLoggedIn,
    getCurrentUsername,
    getCurrentUserData,
    updateUserData,
    updateProfile,
    updateSkills,
    updateProjects,
    exportUserData,
    importUserData
  };
})();
