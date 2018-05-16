import React from 'react';
import axios from 'axios';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import CircularProgress from 'material-ui/Progress/CircularProgress';
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
          onSubmit={this.handleSubmit}
        >
          <input type="file" name="file" className="form-item" onChange={this.addFile} />

          {this.props.askDescription
          ?
            <TextField
              name="description"
              label="Description"
              className="form-item"
              value={this.state.description}
              margin="normal"
              onChange={this.handleChange}
            />
            : ''
          }
          {this.state.buttonDisabled ? <CircularProgress /> : ''}
          <Button
            type="submit"
            id="submit-project"
            variant="raised"
            color="primary"
            disabled={!this.state.hasFile || this.state.buttonDisabled}
          >
            Upload<i className="material-icons icon-right">file_upload</i>
          </Button>
        </form>
      </div>
    );
  }
}

FileUpload.propTypes = {
  url: PropTypes.string.isRequired,
  askDescription: PropTypes.bool,
  passResponse: PropTypes.func.isRequired,
};

FileUpload.defaultProps = {
  askDescription: true,
};

export default FileUpload;
