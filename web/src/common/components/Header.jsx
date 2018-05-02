import React from 'react';
import AppBar from 'material-ui/AppBar';
import { Link } from 'react-router-dom';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import '../css/Header.scss';

class Header extends React.Component {
  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              <Link to="/" className="header-link">UEF Projektipankki</Link>
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default Header;
