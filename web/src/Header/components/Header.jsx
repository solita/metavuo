import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import InfoDialog from './InfoDialog';
import '../css/Header.scss';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoOpen: false,
    };
    this.openInfo = this.openInfo.bind(this);
    this.closeInfo = this.closeInfo.bind(this);
  }

  openInfo() {
    this.setState({ infoOpen: true });
  }

  closeInfo() {
    this.setState({ infoOpen: false });
  }

  render() {
    return (
      <div className="header-root">
        <AppBar position="static" className="header-style">
          <Toolbar>
            <div className="header-title">
              <Link to="/" className="button-link">
                <span className="title-meta">meta</span><span className="title-vuo">vuo</span>
              </Link>
            </div>
            <div className="header-actions">
              {this.props.isUser &&
              <div className="header-button-margin">
                <Button variant="fab" className="secondary-button round-button" onClick={this.openInfo}>
                  <i className="material-icons button-icon">help_outline</i>
                </Button>
              </div>
              }
              {this.props.isAdmin &&
              <div className="header-button-margin">
                <Link to="/admin" className="button-link">
                  <Tooltip id="tooltip-fab" title="Admin panel" placement="bottom">
                    <Button variant="fab" className="primary-button round-button">
                      <i className="material-icons button-icon">settings</i>
                    </Button>
                  </Tooltip>
                </Link>
              </div>
              }
              <div className="header-button-margin" />
              <div className="header-user">
                <Button variant="fab" className="black-button round-button">
                  <i className="material-icons button-icon">perm_identity</i>
                </Button>
                {this.props.userEmail}
              </div>
            </div>
          </Toolbar>
        </AppBar>
        <InfoDialog dialogOpen={this.state.infoOpen} closeDialog={this.closeInfo} />
      </div>
    );
  }
}

Header.propTypes = {
  isAdmin: PropTypes.bool,
  isUser: PropTypes.bool,
  userEmail: PropTypes.string,
};

Header.defaultProps = {
  isAdmin: false,
  isUser: false,
  userEmail: '',
};

export default Header;
