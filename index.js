const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const menuBtn = document.querySelector('#menu-icon');
const navbar = document.querySelector('#navbar');
const navLinks = document.querySelectorAll('.navbar a');
const sections = document.querySelectorAll('main section');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('.counter');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.className = 'bx bx-sun';
}

themeToggle?.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    if (themeIcon) themeIcon.className = isDark ? 'bx bx-moon' : 'bx bx-sun';
});

menuBtn?.addEventListener('click', () => {
    navbar.classList.toggle('active');
});

window.addEventListener('scroll', () => {
    const pos = window.scrollY + 200;

    sections.forEach((section) => {
        const id = section.getAttribute('id');
        if (pos >= section.offsetTop && pos < section.offsetTop + section.offsetHeight) {
            navLinks.forEach((link) => link.classList.remove('active'));
            const activeLink = document.querySelector(`.navbar a[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });

    navbar.classList.remove('active');
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('counter')) runCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

reveals.forEach((el) => observer.observe(el));
counters.forEach((counter) => observer.observe(counter));

if (window.Typed) {
    new Typed('.multiple-text', {
        strings: ['Java', 'Spring Boot', 'Redis', 'Kafka', 'Debezium', 'PostgreSQL', 'SQL', 'MongoDB', 'gRPC', 'WebSocket', 'Keycloak'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
}

function runCounter(counter) {
    const target = Number(counter.dataset.target || 0);
    const duration = 2400;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        counter.textContent = String(value);
        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = String(target);
    }

    requestAnimationFrame(update);
}

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const payload = {
            name: String(formData.get('name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            message: String(formData.get('message') || '').trim()
        };

        if (!payload.name || !payload.email || !payload.message) {
            showFormStatus('Please fill all fields.', 'error');
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        showFormStatus('Sending message...', '');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send message.');

            contactForm.reset();
            showFormStatus('Message sent successfully.', 'success');
        } catch (error) {
            showFormStatus(error.message || 'Could not send message now.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
}

function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove('success', 'error');
    if (type) formStatus.classList.add(type);
}
