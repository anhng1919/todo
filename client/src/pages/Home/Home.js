import React from 'react';
import {Link} from 'react-animated-navigator';


export default (props) => {
  return (
    <div>
      Home

      <Link to="/new" transition="flyUp">
        New
      </Link>
    </div>
  )
}
