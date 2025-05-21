FROM jekyll/jekyll:4.2.2

WORKDIR /workspace
COPY . .

# Install dependencies (if you have a Gemfile)
RUN bundle install

EXPOSE 4000

CMD ["jekyll", "serve", "--host", "0.0.0.0"]