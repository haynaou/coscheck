import React from 'react';
import isString from 'lodash/isString';
import map from 'lodash/map';

const Error = ({ error }) => (
  <div
    style={{ backgroundColor: '#fff5f6' }}
    className="py-3 mb-4 px-4 text-sm bg-red-100 text-red-800 border border-red-200 rounded w-full"
  >
    {isString(error)
      ? error
      : map(error, (message, field) => (
          <div key={field} className="flex">
            <div className="mr-1">- {field}:</div>
            <div>{message}</div>
          </div>
        ))}
  </div>
);

export default Error;
