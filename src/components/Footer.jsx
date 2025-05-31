import React from 'react';

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { text: "About Last.fm", url: "#" },
        { text: "Contact Us", url: "#" },
        { text: "Jobs", url: "#" }
      ]
    },
    {
      title: "Help",
      links: [
        { text: "Track My Music", url: "#" },
        { text: "Community Support", url: "#" },
        { text: "Community Guidelines", url: "#" },
        { text: "Help", url: "#" }
      ]
    },
    {
      title: "Goodies",
      links: [
        { text: "Download Scrobbler", url: "#" },
        { text: "Developer API", url: "#" },
        { text: "Free Music Downloads", url: "#" },
        { text: "Merchandise", url: "#" }
      ]
    },
    {
      title: "Account",
      links: [
        { text: "Inbox", url: "#" },
        { text: "Settings", url: "#" },
        { text: "Last.fm Pro", url: "#" },
        { text: "Logout", url: "#" }
      ]
    },
    {
      title: "Follow Us",
      links: [
        { text: "Facebook", url: "#" },
        { text: "X", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "YouTube", url: "#" }
      ]
    }
  ];

  const languages = [
    "Deutsch", "Español", "Français", "Italiano", "日本語",
    "Polski", "Português", "Русский", "Svenska", "Türkçe", "简体中文"
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-links-container">
          {footerSections.map((section, index) => (
            <section key={index} className="footer-section">
              <h3 className="footer-heading">{section.title}</h3>
              <ul className="footer-links">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.url} className="footer-link">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        
        <div className="language-selector">
          <span className="current-language">English</span>
          <ul className="language-list">
            {languages.map((language, index) => (
              <li key={index}>
                <a href="#" className="language-link">{language}</a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="footer-branding">
          <a href="#" className="audioscrobbler-link">
            <img 
              src="img/logo/footer_logo.png" 
              alt="Audioscrobbler" 
              className="footer-logo" 
            />
            <span>Audioscrobbler</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;