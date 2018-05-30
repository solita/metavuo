import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ProjectForm from './ProjectForm';

class CreateProjectDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClickOpen() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  render() {
    return (
      <div>
        <Button variant="raised" className="primary-button text-button" onClick={this.handleClickOpen}>
          <i className="material-icons text-button-icon">add_circle_outline</i>Add project
        </Button>
        <Dialog
          open={this.state.isOpen}
          onClose={this.handleClose}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle className="dialog-header">Create new project</DialogTitle>
          <DialogContent>
            <ProjectForm handleClose={this.handleClose} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default CreateProjectDialog;
