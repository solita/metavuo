import React from 'react';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

class InfoDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      message: '',
    };
    this.getInfoText = this.getInfoText.bind(this);
  }

  getInfoText() {
    axios.get('/api/info')
      .then((res) => {
        if (res.data !== null) {
          this.setState({ title: res.data.title || '', content: res.data.content || 'No info' });
        }
      })
      .catch((err) => {
        if (err.response.status === 403) {
          this.setState({ message: 'No access' });
        } else if (err.response.status === 404) {
          this.setState({ message: 'No info' });
        } else {
          this.setState({ message: 'Problem getting info' });
        }
      });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.closeDialog}
        onEnter={this.getInfoText}
        fullWidth
        maxWidth="md"
      >
        <div className="info-header">
          <div><h2>{this.state.title}</h2></div>
          <Button onClick={this.props.closeDialog} className="secondary-button text-button">
            <i className="material-icons text-button-icon">close</i>Close
          </Button>
        </div>
        <div className="info-content">
          {this.state.message && <p className="message-errors">{this.state.message}</p>}
          <div className="show-newlines">
            {this.state.content.split('/n').map(row => <p key={row}>{row}</p>)}
          </div>
        </div>
      </Dialog>
    );
  }
}

InfoDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
};

export default InfoDialog;
