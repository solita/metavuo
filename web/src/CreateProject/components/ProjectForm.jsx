import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { ValidatorForm } from 'react-material-ui-form-validator';
import ProjectFormFields from './ProjectFormFields';


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
        if (err.response.status === 403) {
          this.setState({ message: 'Creating project not allowed' });
        } else if (err.response.status === 400) {
          this.setState({ message: `Form is not valid: ${err.response.data}` });
        } else {
          this.setState({ message: 'something went wrong' });
        }
      });
  }

  render() {
    return (
      <div>
        {this.state.message && <p className="message-errors">{this.state.message}</p>}
        <ValidatorForm
          onSubmit={this.handleSubmit}
          autoComplete="off"
        >
          <div className="divider-section">
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
            <Button onClick={this.props.handleClose} variant="raised" className="secondary-button text-button">
              Cancel
            </Button>
            <Button type="submit" id="submit-project" variant="raised" className="primary-button text-button">
              <i className="material-icons text-button-icon">save</i> Save
            </Button>
          </DialogActions>
        </ValidatorForm>
      </div>
    );
  }
}

ProjectForm.propTypes = {
  history: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withRouter(ProjectForm);
