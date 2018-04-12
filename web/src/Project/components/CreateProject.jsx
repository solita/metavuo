import React from 'react';
import ProjectForm from './ProjectForm';

class CreateProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div>
        <h2>Create new project</h2>
        <ProjectForm />
      </div>
    );
  }
}

export default CreateProject;
