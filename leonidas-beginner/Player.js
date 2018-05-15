class Player {

  constructor () {
    this.direction = 'forward'
    this.firstRound = true
    this.healthWounded = 6
    this.healthRecovered = 12
  }

  playTurn(warrior) {
    this.warrior = warrior

    // Turn around in the very first round (with some hacky conditionals)
    if (this.firstRound) {
      this.firstRound = false
      if (this.isCaptiveInSight(this.getOppositeDirection()) && !this.isEndOfLine(this.getOppositeDirection())) {
        warrior.pivot()
        return this.terminate()
      }
    }

    // Go up the stairs if they are right next to us
    if (this.isStairsNext()) {
      warrior.walk(this.direction)
      return this.terminate()
    }

    // Turn around when hitting wall
    if (this.isEndOfLine() && !this.isUnderAttack()) {
      warrior.pivot()
      return this.terminate()
    }
    
    // Rescue captive if next to us
    if (warrior.feel(this.direction).isCaptive()) {
      warrior.rescue(this.direction)
      return this.terminate()
    }

    // Attack enemy if next to us
    if (warrior.feel(this.direction).isEnemy()) {
      warrior.attack(this.direction)
      return this.terminate()
    }

    // Shoot at enemy if in sight
    if (this.isEnemyInSight() && !this.isUnderAttack() && !this.isUnitInSight(['Sludge'])) {
      warrior.shoot()
      return this.terminate()
    }
    
    // Step back when wounded and under attack
    if (this.isWounded() && this.isUnderAttack()) {
      warrior.walk(this.getOppositeDirection())
      return this.terminate()
    }

    // Rest if damaged and not under attack and not about to reach stairs
    if (this.isWounded() && !this.isUnderAttack() && !this.isCaptiveInSight() && !this.isStairsEndOfLine()) {
      warrior.rest()
      return this.terminate()
    }

    // Continue resting if already began (and dont over-rest unnecessarily)
    if (this.isResting() && warrior.health() < (this.getFirstUnitHealthInSight() || this.healthRecovered)) {
      warrior.rest()
      return this.terminate()
    }
    
    // Walk forward
    warrior.walk(this.direction)
    return this.terminate()
  }

  // Cache the current health until next round before ending
  terminate () {
    this.health = this.warrior.health()
  }

  isWounded() {
    return this.warrior.health() < this.healthWounded
  }

  isEnemyInSight(direction = this.direction) {
    const unit = this.warrior.look(direction).find(space => !space.isEmpty())
    return unit && unit.isEnemy()
  }

  isUnitInSight(unitNames, direction = this.direction) {
    return this.warrior.look(direction).find(space => unitNames.includes(space.toString())) 
  }

  getFirstUnitHealthInSight(direction = this.direction) {
    const unit = this.warrior.look(direction).find(space => space.isEnemy())
    return unit ? unit.getUnit().health - 3 : null
  }

  isCaptiveInSight(direction = this.direction) {
    return this.warrior.look(direction).find(space => space.isCaptive())
  }

  isEndOfLine(direction = this.direction) {
    const wall = this.warrior.look(direction).find(space => space.isWall())
    const stairs = this.warrior.look(direction).find(space => space.isStairs())
    const units = this.warrior.look(direction).find(space => this.isUnit(space))
    return wall && !units && !stairs
  }

  isStairsEndOfLine(direction = this.direction) {
    const stairs = this.warrior.look(direction).find(space => space.isStairs())
    const units = this.warrior.look(direction).find(space => this.isUnit(space))
    return stairs && !units
  }

  isStairsNext(direction = this.direction) {
    return this.warrior.feel(direction).isStairs() && !this.isUnit(this.warrior.feel(direction))
  }

  getOppositeDirection(direction = this.direction) {
    return direction === 'forward' ? 'backward' : 'forward'
  }

  isUnderAttack() {
    return this.warrior.health() < this.health
  }

  isResting() {
    return this.warrior.health() > this.health
  }

  isUnit(space) {
    return !space.isEmpty() && (space.isEnemy() || space.isCaptive())
  }

}
