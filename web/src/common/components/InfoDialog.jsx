import React from 'react';
import axios from 'axios';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import Button from 'material-ui/Button';
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
          this.setState({ message: '' });
        } else if (err.response.status === 404) {
          this.setState({ message: 'No info' });
        } else {
          this.setState({message: 'Problem getting info'});
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
        <DialogActions>
          <Button onClick={this.props.closeDialog}>
            Close<i className="material-icons icon-right">close</i>
          </Button>
        </DialogActions>
        <DialogTitle>{this.state.title}</DialogTitle>
        <DialogContent>
          {this.state.message && <p>{this.state.message}</p>}
          <div className="show-newlines">
            {this.state.content.split('/n').map(row => <p key={row}>{row}</p>)}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

InfoDialog.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
};

export default InfoDialog;
