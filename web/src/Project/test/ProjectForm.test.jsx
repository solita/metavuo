import React from 'react';
import ProjectForm from '../../CreateProject/components/ProjectForm';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

let formComponent;

beforeEach(() => {
  formComponent = shallow(<ProjectForm />);
});

describe('Project form', () => {

  it('should match its empty snapshot', () => {
    const tree = renderer.create(
      <ProjectForm />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

});
