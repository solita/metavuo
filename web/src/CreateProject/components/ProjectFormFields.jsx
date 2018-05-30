import React from 'react';
import PropTypes from 'prop-types';
import { TextValidator } from 'react-material-ui-form-validator';

const ProjectFormFields = props => (
  <div>
    <TextValidator
      className="form-control"
      id="name"
      name="name"
      label="Project name *"
      value={props.name}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
      validators={['required', 'matchRegexp:^[\\w_-]*$']}
      errorMessages={['Name cannot be blank.', 'Only alphanumeric characters including dash and underscore allowed']}
    />
    <TextValidator
      className="form-control"
      id="description"
      name="description"
      label="Description *"
      multiline
      rowsMax="8"
      value={props.description}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
      validators={['required', 'maxStringLength:500']}
      errorMessages={['Description is mandatory.', 'Maximum length is 500 characters.']}
    />
    <TextValidator
      className="form-control"
      id="internalReference"
      name="internalReference"
      label="Internal reference number"
      value={props.internalReference}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
    />
    <TextValidator
      className="form-control"
      id="sampleLocation"
      name="sampleLocation"
      label="Sample location"
      value={props.sampleLocation}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
      validators={['maxStringLength:500']}
      errorMessages={['Maximum length is 500 characters.']}
    />
    <TextValidator
      className="form-control"
      id="info"
      name="info"
      label="Additional information"
      value={props.info}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
      validators={['maxStringLength:500']}
      errorMessages={['Maximum length is 500 characters.']}
    />
    <h2>Customer details</h2>
    <TextValidator
      className="form-control"
      id="organization"
      name="organization"
      label="Customer organization *"
      value={props.organization}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
      validators={['required']}
      errorMessages={['Organization cannot be blank.']}
    />
    <TextValidator
      className="form-control"
      id="invoiceAddress"
      name="invoiceAddress"
      label="Customer invoice address"
      value={props.invoiceAddress}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
    />
    <TextValidator
      className="form-control"
      id="customerName"
      name="customerName"
      label="Customer name"
      value={props.customerName}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
    />
    <TextValidator
      className="form-control"
      id="customerEmail"
      name="customerEmail"
      label="Customer email"
      value={props.customerEmail}
      onChange={props.handleChange}
      errorMessages={['Invalid email-address.']}
      validators={['isEmail']}
      margin="dense"
      fullWidth
    />
    <TextValidator
      className="form-control"
      id="customerPhone"
      name="customerPhone"
      label="Customer phone number"
      value={props.customerPhone}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
    />
    <TextValidator
      className="form-control"
      id="customerReference"
      name="customerReference"
      label="Customer reference number"
      value={props.customerReference}
      onChange={props.handleChange}
      margin="dense"
      fullWidth
    />
  </div>
);


ProjectFormFields.propTypes = {
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
  handleChange: PropTypes.func.isRequired,
};

export default ProjectFormFields;
