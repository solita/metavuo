import React from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import DialogActions from 'material-ui/Dialog/DialogActions';
import PropTypes from 'prop-types';

class StorageFileUpload extends React.Component {
  constructor(props) {
    super(props);
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
      this.props.closeDialog();
    });
  }

  addFile(event) {
    this.setState({ file: event.target.files[0] });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.closeDialog}
      >
        <DialogActions>
          <Button onClick={this.props.closeDialog}>
            Close<i className="material-icons icon-right">close</i>
          </Button>
        </DialogActions>
        <DialogTitle>{this.props.titleText}</DialogTitle>
        <DialogContent>
          <form
            id="form-object"
            onSubmit={this.handleSubmit}
          >
            <input type="file" name="file" className="form-item" onChange={this.addFile} />
            <Button type="submit" id="submit-project" variant="raised" color="primary" disabled={false}>
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
};

StorageFileUpload.defaultProps = {
  titleText: '',
};

export default StorageFileUpload;
