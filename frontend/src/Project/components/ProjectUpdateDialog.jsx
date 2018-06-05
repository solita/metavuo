import React from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ValidatorForm } from 'react-material-ui-form-validator';
import PropTypes from 'prop-types';
import ProjectFormFields from '../../CreateProject/components/ProjectFormFields';

class ProjectUpdateDialog extends React.Component {
  constructor(props) {
    super(props);

    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      isOpen: false,
      name: this.props.parentState.name,
      description: this.props.parentState.description,
      organization: this.props.parentState.organization,
      invoiceAddress: this.props.parentState.invoiceAddress,
      customerName: this.props.parentState.customerName,
      customerEmail: this.props.parentState.customerEmail,
      customerPhone: this.props.parentState.customerPhone,
      customerReference: this.props.parentState.customerReference,
      internalReference: this.props.parentState.internalReference,
      sampleLocation: this.props.parentState.sampleLocation,
      info: this.props.parentState.info,
      errorMsg: '',
    };
  }

  handleClickOpen() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    axios.put(
      this.props.url,
      JSON.stringify({
        project_name: this.state.name,
        project_description: this.state.description,
        customer_organization: this.state.organization,
        customer_invoice_address: this.state.invoiceAddress,
        customer_name: this.state.customerName,
        customer_email: this.state.customerEmail,
        customer_phone: this.state.customerPhone,
        customer_reference: this.state.customerReference,
        customer_internal_reference: this.state.internalReference,
        sample_location: this.state.sampleLocation,
        additional_information: this.state.info,
      }),
    ).catch(() => {
      this.setState({ errorMsg: 'Updating project failed' });
    }).finally(() => {
      this.props.updateMainView();
      this.handleClose();
    });
  }

  render() {
    return (
      <div>
        <Button
          onClick={this.handleClickOpen}
          variant="raised"
          className="primary-button text-button"
        >
          <i className="material-icons text-button-icon">edit</i>Edit project
        </Button>
        <Dialog
          open={this.state.isOpen}
          onClose={this.handleClose}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <DialogTitle className="dialog-header">Edit project</DialogTitle>
          <DialogContent>
            {this.state.errorMsg && <p className="message-errors">{this.state.errorMsg}</p>}
            <ValidatorForm
              id="form-object"
              onSubmit={this.handleSubmit}
              autoComplete="off"
            >
              <div className="divider-section">
                <h2>Project details</h2>
                <ProjectFormFields
                  name={this.state.name}
                  description={this.state.description}
                  internalReference={this.state.internalReference}
                  sampleLocation={this.state.sampleLocation}
                  info={this.state.info}
                  organization={this.state.organization}
                  invoiceAddress={this.state.invoiceAddress}
                  customerName={this.state.customerName}
                  customerEmail={this.state.customerEmail}
                  customerPhone={this.state.customerPhone}
                  customerReference={this.state.customerReference}
                  handleChange={this.handleChange}
                />
              </div>
              <DialogActions>
                <Button onClick={this.handleClose} variant="raised" className="secondary-button text-button">
                Cancel
                </Button>
                <Button
                  type="submit"
                  id="submit-update"
                  variant="raised"
                  className="primary-button text-button"
                  disabled={!this.state.name || !this.state.description || !this.state.organization}
                >
                  <i className="material-icons text-button-icon">save</i>Save
                </Button>
              </DialogActions>
            </ValidatorForm>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

ProjectUpdateDialog.propTypes = {
  url: PropTypes.string.isRequired,
  updateMainView: PropTypes.func.isRequired,
  parentState: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    internalReference: PropTypes.string.isRequired,
    sampleLocation: PropTypes.string.isRequired,
    info: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
    invoiceAddress: PropTypes.string.isRequired,
    customerName: PropTypes.string.isRequired,
    customerEmail: PropTypes.string.isRequired,
    customerPhone: PropTypes.string.isRequired,
    customerReference: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProjectUpdateDialog;
