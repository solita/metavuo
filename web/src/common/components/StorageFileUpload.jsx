import React from 'react';
import { Button, Dialog } from 'material-ui';
import PropTypes from 'prop-types';

class StorageFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFile = this.addFile.bind(this);
    this.state = {
      file: null,
      signedUrl: '',
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    data.append('file', this.state.file);

    fetch(this.state.signedUrl, {
      method: 'PUT',
      headers: { 'content-type': 'text/plain' },
      body: data.get('file'),
    }).then((res) => {
      console.log(res);
      this.closeDialog();
    });
  }
  closeDialog() {
    this.props.closeFileDialog();
  }

  addFile(event) {
    this.setState({ file: event.target.files[0] });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.closeDialog}
      >
        <div>
          <Button onClick={this.closeDialog}>
            Close<i className="material-icons icon-right">close</i>
          </Button>
          <form
            id="form-object"
            onSubmit={this.handleSubmit}
          >
            <input type="file" name="file" className="form-item" onChange={this.addFile} />
            <Button type="submit" id="submit-project" variant="raised" color="primary" disabled={false}>
              Upload<i className="material-icons icon-right">file_upload</i>
            </Button>
          </form>
        </div>
      </Dialog>
    );
  }
}

StorageFileUpload.propTypes = {
  closeFileDialog: PropTypes.func.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
};


export default StorageFileUpload;
