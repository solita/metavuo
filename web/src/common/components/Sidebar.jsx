import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Sidebar.scss';

class Sidebar extends React.Component {
  render() {
    return (
      <div className="sidebar-container">
        <p>Menu</p>

        <ul className="navigation-list">
          <li className="navigation-link">
            <Link to="/">Home</Link>
          </li>
          <li className="navigation-link">
            <Link to="/projects">Projects</Link>
          </li>
          <li className="navigation-link">
            <Link to="/projects/new">Create new project</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Sidebar;
