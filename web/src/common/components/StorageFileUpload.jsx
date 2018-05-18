import React from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import PropTypes from 'prop-types';
import axios from 'axios';
import { TextField } from 'material-ui';

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
    axios.post(this.props.url, data).then((res) => {
      if (res.status === 200) {
        axios.put(
          res.data, this.state.file,
          { headers: { 'Content-Type': 'text/plain', 'x-goog-meta-description': this.state.description, 'x-goog-meta-uploadedby': this.props.userEmail } },
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
    this.setState({ description: event.target.value });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.closeDialog}
      >
        <DialogActions>
          <Button onClick={this.props.closeDialog}>
            Close<i className="material-icons icon-right">close</i>
          </Button>
        </DialogActions>
        <DialogTitle>{this.props.titleText}</DialogTitle>
        <DialogContent>
          <p className="form-errors">{this.state.message}</p>
          <form
            id="form-object"
            onSubmit={this.handleSubmit}
          >
            <TextField
              name="description"
              label="Description"
              className="form-item"
              value={this.state.description}
              margin="normal"
              onChange={this.handleChange}
              inputProps={{ maxLength: 200 }}
            />
            <input type="file" name="file" className="form-item" onChange={this.addFile} />
            <Button type="submit" id="submit-project" variant="raised" color="primary" disabled={!this.state.hasFile}>
              Upload<i className="material-icons icon-right">file_upload</i>
            </Button>
          </form>
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
};

StorageFileUpload.defaultProps = {
  titleText: '',
};

export default StorageFileUpload;
