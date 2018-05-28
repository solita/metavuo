import React from 'react';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import '../css/FileUpload.scss';

class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      description: '',
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
    if (this.props.askDescription) data.append('description', this.state.description);
    axios.post(this.props.url, data, { headers: { 'content-type': 'multipart/form-data' } })
      .then((res) => {
        this.setState({ buttonDisabled: false });
        this.props.passResponse(res.data);
      })
      .catch((err) => {
        if (err.response.data) {
          err.response.data.forEach((error) => {
            this.setState({
              message: this.state.message.concat(`${error.error}:\n${error.detail}\n`),
              buttonDisabled: false,
            });
          });
        }
      });
  }

  render() {
    return (
      <div>
        <p className="form-errors">{this.state.message}</p>
        <form
          id="form-object"
          autoComplete="off"
        >
          <input type="file" name="file" onChange={this.addFile} />

          {this.props.askDescription
          ?
            <TextField
              name="description"
              label="Description"
              value={this.state.description}
              margin="normal"
              onChange={this.handleChange}
              fullWidth
            />
            : ''
          }
          {this.state.buttonDisabled ? <CircularProgress /> : ''}
        </form>
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
  askDescription: PropTypes.bool,
  passResponse: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired,
};

FileUpload.defaultProps = {
  askDescription: true,
};

export default FileUpload;
