import { forwardAxiosRequest } from '@/lib/forwardAxiosRequest';

const getPath = async (params) => {
  const { proxy } = await params;
  const path = Array.isArray(proxy) ? proxy.join('/') : '';
  return path;
};

export async function GET(request, { params }) {
  const path = await getPath(params);
  return forwardAxiosRequest('get', `/${path}`, request);
}

export async function POST(request, { params }) {
  const path = await getPath(params);
  const contentType = request.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      data = await request.formData();
    } else {
      data = await request.text();
    }
  } catch (error) {
    data = null;
  }

  return forwardAxiosRequest('post', `/${path}`, request, data);
}

export async function PUT(request, { params }) {
  const path = await getPath(params);
  const contentType = request.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      data = await request.formData();
    } else {
      data = await request.text();
    }
  } catch (error) {
    data = null;
  }

  return forwardAxiosRequest('put', `/${path}`, request, data);
}

export async function PATCH(request, { params }) {
  const path = await getPath(params);
  const contentType = request.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      data = await request.formData();
    } else {
      data = await request.text();
    }
  } catch (error) {
    data = null;
  }

  return forwardAxiosRequest('patch', `/${path}`, request, data);
}

export async function DELETE(request, { params }) {
  const path = await getPath(params);
  const contentType = request.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      data = await request.formData();
    } else {
      data = await request.text();
    }
  } catch (error) {
    data = null;
  }

  return forwardAxiosRequest('delete', `/${path}`, request, data);
}
