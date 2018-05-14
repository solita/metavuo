import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import PropTypes from 'prop-types';
import '../css/Header.scss';

const Header = props => (
  <div className="header-root" >
    <AppBar position="static">
      <Toolbar>
        <Typography variant="title" className="header-title">
          <Link to="/" className="header-link">UEF Projektipankki</Link>
        </Typography>
        <div className="margin-right">
          {props.isAdmin
            ?
              <Link to="/admin" className="header-button-link">
                <Tooltip id="tooltip-fab" title="Admin panel" placement="bottom">
                  <Button variant="fab" mini>
                    <i className="material-icons">settings</i>
                  </Button>
                </Tooltip>
              </Link>
            : ''}
        </div>
        <div>{props.usersName}</div>
      </Toolbar>
    </AppBar>
  </div>
);

Header.propTypes = {
  isAdmin: PropTypes.bool,
  usersName: PropTypes.string,
};

Header.defaultProps = {
  isAdmin: false,
  usersName: '',
};

export default Header;
