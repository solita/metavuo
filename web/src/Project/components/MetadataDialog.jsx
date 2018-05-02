import React from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import FileUpload from '../../common/components/FileUpload';

class MetadataDialog extends React.Component {
  constructor(props) {
    super(props);
    this.closeDialog = this.closeDialog.bind(this);
    this.passResponse = this.passResponse.bind(this);
  }

  closeDialog() {
    this.props.closeDialog();
  }

  passResponse(res) {
    this.props.passResponse(res);
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.closeDialog}
        disableBackdropClick
      >
        <div className="upload-container">
          <Button onClick={this.closeDialog}>
            Close<i className="material-icons icon-right">close</i>
          </Button>
          <FileUpload
            heading="Metadata file upload"
            url="/api/projects/metadata"
            askDescription={false}
            id={this.props.projectId}
            passResponse={this.passResponse}
          />
        </div>
      </Dialog>
    );
  }
}

export default MetadataDialog;
