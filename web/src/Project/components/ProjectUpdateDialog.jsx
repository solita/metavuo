import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from 'material-ui';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import axios from 'axios/index';
import PropTypes from 'prop-types';

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
    ).catch((error) => {
      console.log(error);
    }).finally(() => {
      this.props.updateMainView();
      this.handleClose();
    });
  }

  render() {
    return (
      <div>
        <Button onClick={this.handleClickOpen} variant="raised" color="primary" style={{ margin: 12 }}>Edit project</Button>
        <Dialog
          open={this.state.isOpen}
          onClose={this.handleClose}
        >
          <DialogTitle id="form-dialog-title">Edit project</DialogTitle>
          <DialogContent>
            <ValidatorForm
              id="form-object"
              onSubmit={this.handleSubmit}
              autoComplete="off"
            >
              <h2>Project details</h2>
              <TextValidator
                className="form-item form-control"
                id="name"
                name="name"
                label="Project name"
                value={this.state.name}
                onChange={this.handleChange}
                margin="normal"
                validators={['required', 'matchRegexp:^[\\w_-]*$']}
                errorMessages={['Name cannot be blank.', 'Only alphanumeric characters including dash and underscore allowed']}
              />
              <TextValidator
                className="form-item form-control"
                id="description"
                name="description"
                label="Description"
                multiline
                rowsMax="8"
                value={this.state.description}
                onChange={this.handleChange}
                margin="normal"
                validators={['required']}
                errorMessages={['Description is mandatory.']}
              />
              <h2>Customer details</h2>
              <TextValidator
                className="form-item form-control"
                id="organization"
                name="organization"
                label="Customer organization"
                value={this.state.organization}
                validators={['required']}
                errorMessages={['Organization cannot be blank.']}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="invoiceAddress"
                name="invoiceAddress"
                label="Customer invoice address"
                value={this.state.invoiceAddress}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="customerName"
                name="customerName"
                label="Customer name"
                value={this.state.customerName}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="customerEmail"
                name="customerEmail"
                label="Customer email"
                value={this.state.customerEmail}
                onChange={this.handleChange}
                errorMessages={['Invalid email-address.']}
                validators={['isEmail']}
              />
              <TextValidator
                className="form-item form-control"
                id="customerPhone"
                name="customerPhone"
                label="Customer phone number"
                value={this.state.customerPhone}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="customerReference"
                name="customerReference"
                label="Customer reference number"
                value={this.state.customerReference}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="internalReference"
                name="internalReference"
                label="Internal reference number"
                value={this.state.internalReference}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="sampleLocation"
                name="sampleLocation"
                label="Sample location"
                value={this.state.sampleLocation}
                onChange={this.handleChange}
              />
              <TextValidator
                className="form-item form-control"
                id="info"
                name="info"
                label="Additional information"
                value={this.state.info}
                onChange={this.handleChange}
              />
              <DialogActions>
                <Button onClick={this.handleClose} variant="raised" color="primary">
                Cancel
                </Button>
                <Button type="submit" id="submit-update" variant="raised" color="primary">
                  <i className="material-icons margin-right">save</i> Save
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
};

export default ProjectUpdateDialog;
