import React from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import '../css/FileUpload.scss';

class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      message: '',
      hasFile: false,
      buttonDisabled: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  addFile(event) {
    this.setState({ file: event.target.files[0], hasFile: true });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ message: '', buttonDisabled: true });

    const data = new FormData();
    data.append('file', this.state.file);
    axios.post(this.props.url, data, { headers: { 'content-type': 'multipart/form-data' } })
      .then((res) => {
        this.setState({ buttonDisabled: false });
        this.props.passResponse(res.data);
      })
      .catch((err) => {
        if (Array.isArray(err.response.data)) {
          err.response.data.forEach((error) => {
            this.setState({
              message: this.state.message.concat(`${error.error}:\n${error.detail}\n`),
              buttonDisabled: false,
            });
          });
        } else if (err.response.data.length > 3) {
          this.setState({ message: err.response.data, buttonDisabled: false });
        } else {
          this.setState({ message: 'File upload failed.', buttonDisabled: false });
        }
      });
  }

  render() {
    return (
      <div>
        {this.state.message && <p className="message-errors">{this.state.message}</p>}
        <div className="divider-section">
          <Input type="file" name="file" onChange={this.addFile} />
          {this.state.buttonDisabled && <CircularProgress />}
        </div>
        <DialogActions>
          <Button className="secondary-button text-button" onClick={this.props.closeDialog}>
            <i className="material-icons text-button-icon">close</i>Cancel
          </Button>
          <Button
            type="submit"
            variant="raised"
            onClick={this.handleSubmit}
            className="primary-button text-button"
            disabled={!this.state.hasFile || this.state.buttonDisabled}
          >
            <i className="material-icons text-button-icon">file_upload</i>Upload
          </Button>
        </DialogActions>
      </div>
    );
  }
}

FileUpload.propTypes = {
  url: PropTypes.string.isRequired,
  passResponse: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired,
};

export default FileUpload;
