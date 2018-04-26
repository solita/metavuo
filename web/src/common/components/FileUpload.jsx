import React from 'react';
import axios from 'axios';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import '../css/FileUpload.scss';

class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      description: '',
      message: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  addFile(event) {
    this.setState({ file: event.target.files[0] });
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData();
    data.append('file', this.state.file);
    data.append('description', this.state.description);
    axios.post(this.props.url, data, { headers: { 'content-type': 'multipart/form-data' } })
      .then((res) => {
        this.props.passResponse(res.data);
        // this.setState({ message: JSON.stringify(res.data) });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ message: err.response.status });
      });
  }

  render() {
    return (
      <div className="form-container">
        {this.state.message}
        <h2>{this.props.heading}</h2>
        <form
          id="form-object"
          autoComplete="off"
          onSubmit={this.handleSubmit}
        >
          <input type="file" name="file" className="form-item" onChange={this.addFile} />

          <TextField
            name="description"
            label="Description"
            className="form-item"
            value={this.state.description}
            margin="normal"
            onChange={this.handleChange}
          />

          <div className="form-item">
            <Button type="submit" id="submit-project" variant="raised" color="primary">
              Upload<i className="material-icons icon-right">file_upload</i>
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

FileUpload.propTypes = {
  heading: PropTypes.string,
  url: PropTypes.string.isRequired,
  passResponse: PropTypes.func.isRequired,
};

FileUpload.defaultProps = {
  heading: '',
};

export default FileUpload;