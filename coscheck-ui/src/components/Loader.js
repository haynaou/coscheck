import React from 'react';
import Loader from 'react-loader-spinner';

const Loading = ({ loading, render }) => {
  return loading ? (
    <div className="flex justify-center my-24">
      <div>
        <Loader type="Grid" color="#ffb5c1" height={120} width={120} />
        <p className="text-lg text-center text-pink-500 pt-8">Loading...</p>
      </div>
    </div>
  ) : (
    render()
  );
};

export default Loading;
