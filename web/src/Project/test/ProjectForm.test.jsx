import React from 'react';
import ProjectForm from '../components/ProjectForm';
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

  it('has all fields', () => {
    expect(formComponent.find('.form-container').length).toBe(1);
    expect(formComponent.find('.form-item').length).toBe(3);
    expect(formComponent.find('#name').length).toBe(1);
    expect(formComponent.find('#description').length).toBe(1);
    expect(formComponent.find('#submit-project').length).toBe(1);
  });

  it('fields are empty', () => {
    expect(formComponent.find('#name').props().value).toEqual('');
    expect(formComponent.find('#description').props().value).toEqual('');
  });

  it('name field can be changed', () => {
    formComponent.find('#name').simulate('change', { target: { name: 'name', value: 'Test name' } });
    expect(formComponent.state('name')).toEqual('Test name');
  });

  it('can be submitted', () => {
    formComponent.find('#form-object').simulate('submit', { preventDefault: jest.fn() });
  })

});
