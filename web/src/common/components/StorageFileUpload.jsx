import React from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const pattern = /^[\w_\-.]*$/;

class StorageFileUpload extends React.Component {
  static validateFileName(name) {
    return pattern.test(name);
  }
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      file: null,
      hasFile: false,
      message: '',
      description: '',
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    data.append('filename', this.state.file.name);
    data.append('description', this.state.description);
    data.append('fileType', this.props.isResult ? 'result' : 'default');
    axios.post(this.props.url, data).then((res) => {
      if (res.status === 200) {
        axios.put(
          res.data, this.state.file,
          {
            headers: {
              'Content-Type': 'text/plain',
              'x-goog-meta-description': this.state.description,
              'x-goog-meta-uploadedby': this.props.userEmail,
              'x-goog-meta-filetype': this.props.isResult ? 'result' : 'default',
            },
          },
        ).catch((err) => {
          console.log(err);
        });
      }
    }).catch((err) => {
      this.setState({ message: err.response.data });
    });
  }

  addFile(event) {
    if (StorageFileUpload.validateFileName(event.target.files[0].name)) {
      this.setState({ file: event.target.files[0], hasFile: true, message: '' });
    } else {
      this.setState({ hasFile: false, message: 'Filename is invalid' });
    }
  }

  closeDialog() {
    this.setState({ hasFile: false, message: '', description: '' });
    this.props.closeDialog();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
      <Dialog

        open={this.props.dialogOpen}
        onClose={this.closeDialog}
      >
        <DialogTitle className="dialog-header">{this.props.titleText}</DialogTitle>
        <DialogContent>
          <p className="form-errors">{this.state.message}</p>
          <form>
            <TextField
              name="description"
              label="Description"
              value={this.state.description}
              margin="normal"
              onChange={this.handleChange}
              inputProps={{ maxLength: 200 }}
              fullWidth
            />
            <input type="file" name="file" onChange={this.addFile} />

          </form>
          <DialogActions>
            <Button onClick={this.props.closeDialog} className="secondary-button text-button" >
              <i className="material-icons text-button-icon">close</i>Cancel
            </Button>
            <Button
              type="submit"
              variant="raised"
              className="primary-button text-button"
              disabled={!this.state.hasFile}
              onClick={this.handleSubmit}
            >
              <i className="material-icons text-button-icon">file_upload</i>Upload
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }
}

StorageFileUpload.propTypes = {
  dialogOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  titleText: PropTypes.string,
  url: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  isResult: PropTypes.bool.isRequired,
};

StorageFileUpload.defaultProps = {
  titleText: '',
};

export default StorageFileUpload;
