
/**
 * Service name
 * @type {string}
 */
const name = 'test'

/**
 * GraphqlServerService class
 */
class TestService {
  constructor (mid) {
    /**
     * Midgar instance
     * @var {Midgar}
     */
    this.mid = mid
  }

  test () {
    return 'test-service-result'
  }
}

export default {
  name,
  service: TestService
}

export { TestService }
