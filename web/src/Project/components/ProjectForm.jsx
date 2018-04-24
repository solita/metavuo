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
