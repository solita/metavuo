import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import PropTypes from 'prop-types';
import '../css/Header.scss';
import InfoDialog from './InfoDialog';

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
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" className="header-title">
              <Link to="/" className="header-link">Metavuo</Link>
            </Typography>
            <div className="margin-right">
              {this.props.isAdmin &&
              <Link to="/admin" className="header-button-link">
                <Tooltip id="tooltip-fab" title="Admin panel" placement="bottom">
                  <Button variant="fab" mini>
                    <i className="material-icons">settings</i>
                  </Button>
                </Tooltip>
              </Link>
              }
              <Button variant="fab" mini onClick={this.openInfo}>
                <i className="material-icons">help_outline</i>
              </Button>
            </div>
            <div>{this.props.userEmail}</div>
          </Toolbar>
        </AppBar>
        <InfoDialog dialogOpen={this.state.infoOpen} closeDialog={this.closeInfo} />
      </div>
    );
  }
}

Header.propTypes = {
  isAdmin: PropTypes.bool,
  userEmail: PropTypes.string,
};

Header.defaultProps = {
  isAdmin: false,
  userEmail: '',
};

export default Header;
