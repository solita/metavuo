import React from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Input from '@material-ui/core/Input';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator/';
import PropTypes from 'prop-types';

class StorageFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      message: '',
      description: '',
      isUploading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.putFile = this.putFile.bind(this);
  }

  handleSubmit(e) {
    this.setState({ message: '' });
    e.preventDefault();
    if (this.state.isUploading) {
      return;
    }
    const data = new FormData();
    data.append('filename', this.state.file.name);
    data.append('description', this.state.description);
    data.append('fileType', this.props.isResult ? 'result' : 'default');
    axios.post(this.props.url, data).then((res) => {
      if (res.status === 200) {
        this.setState({ isUploading: true, message: 'Uploading... This dialog will close once the upload is complete.' });
        this.putFile(res);
      }
    }).catch((err) => {
      if (err.response.status === 400) {
        this.setState({ message: err.response.data, isUploading: false });
      } else {
        this.setState({ message: 'Something went wrong', isUploading: false });
      }
    });
  }

  addFile(event) {
    if (event.target.files.length > 0) {
      this.setState({ file: event.target.files[0], message: '' });
    } else {
      this.setState({ file: null, message: '' });
    }
  }

  closeDialog() {
    this.setState({
      file: null,
      message: '',
      description: '',
      isUploading: false,
    });
    this.props.closeDialog();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  putFile(res) {
    axios.put(
      res.data.url, this.state.file,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-goog-meta-description': res.data.description,
          'x-goog-meta-uploadedby': this.props.userEmail,
          'x-goog-meta-filetype': this.props.isResult ? 'result' : 'default',
        },
      },
    )
      .then(() => {
        this.props.updateFileList();
        this.closeDialog();
      })
      .catch(() => {
        this.setState({ message: 'File upload failed', isUploading: false });
      });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.closeDialog}
      >
        <DialogTitle className="dialog-header">{this.props.titleText}</DialogTitle>
        <DialogContent>
          {this.state.message && <p className="form-errors">{this.state.message}</p>}
          <ValidatorForm
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <div className="divider-section">
              <TextValidator
                name="description"
                label="Description"
                value={this.state.description}
                onChange={this.handleChange}
                margin="normal"
                fullWidth
                validators={['maxStringLength:1000']}
                errorMessages={['Maximum length is 1000 characters.']}
              />
              <Input
                type="file"
                name="file"
                onChange={this.addFile}
                disableUnderline
              />
            </div>
            <DialogActions>
              <Button onClick={this.closeDialog} className="secondary-button text-button" >
                <i className="material-icons text-button-icon">close</i>Cancel
              </Button>
              <Button
                type="submit"
                variant="raised"
                className="primary-button text-button"
                disabled={(this.state.file === null) || this.state.isUploading}
              >
                <i className="material-icons text-button-icon">file_upload</i>Upload
              </Button>
            </DialogActions>
          </ValidatorForm>
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
  updateFileList: PropTypes.func.isRequired,
};

StorageFileUpload.defaultProps = {
  titleText: '',
};

export default StorageFileUpload;
