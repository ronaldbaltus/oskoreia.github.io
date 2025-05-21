FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y build-essential nodejs npm git && \
    gem install jekyll bundler

# Set up working directory
WORKDIR /workspace

# Copy Gemfile if you have one, then install
COPY Gemfile* ./
RUN bundle install || true

# Copy the rest of your files
COPY . .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload", "--incremental"]