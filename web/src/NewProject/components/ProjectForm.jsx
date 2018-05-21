import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import '../css/ProjectForm.scss';


export class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      message: '',
      organization: '',
      invoiceAddress: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerReference: '',
      internalReference: '',
      sampleLocation: '',
      info: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ message: '' });

    axios.post(
      '/api/projects',
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
    )
      .then((res) => {
        const id = res.data;
        this.props.history.push(`/projects/${id}`);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          this.setState({ message: 'form is not valid' });
        } else {
          this.setState({ message: 'something went wrong' });
        }
      });
  }

  render() {
    return (
      <Grid
        className="form-container"
      >
        {this.state.message}
        <ValidatorForm
          id="form-object"
          onSubmit={this.handleSubmit}
          autoComplete="off"
        >
          <TextValidator
            className="form-item form-control"
            id="name"
            name="name"
            label="Project name *"
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
            label="Description *"
            multiline
            rowsMax="8"
            value={this.state.description}
            onChange={this.handleChange}
            margin="normal"
            validators={['required']}
            errorMessages={['Description is mandatory.']}
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
          <h2>Customer details</h2>
          <TextValidator
            className="form-item form-control"
            id="organization"
            name="organization"
            label="Customer organization *"
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
          <div className="form-item">
            <Button type="submit" id="submit-project" variant="raised" color="primary">
              <i className="material-icons margin-right">save</i> Save
            </Button>
          </div>
        </ValidatorForm>
      </Grid>
    );
  }
}

ProjectForm.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(ProjectForm);
