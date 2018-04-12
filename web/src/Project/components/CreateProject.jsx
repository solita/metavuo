import React from 'react';
import Button from 'material-ui/Button';

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
        <p>Here be fields</p>
        <Button variant="raised" color="primary">Save</Button>
      </div>
    );
  }
}

export default CreateProject;
