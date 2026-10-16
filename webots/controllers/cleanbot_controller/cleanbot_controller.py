from controller import Robot

TIME_STEP = 32
MAX_SPEED = 6.0

robot = Robot()
left = robot.getDevice('left_motor')
right = robot.getDevice('right_motor')
front = robot.getDevice('front_sensor')

left.setPosition(float('inf'))
right.setPosition(float('inf'))
front.enable(TIME_STEP)

left.setVelocity(0.0)
right.setVelocity(0.0)

step_count = 0
turn_steps = 0

while robot.step(TIME_STEP) != -1:
    step_count += 1
    value = front.getValue()

    # Para este sensor simulado, valores altos indican obstáculo cercano.
    obstacle_close = value > 650.0

    if turn_steps > 0:
        left.setVelocity(MAX_SPEED * 0.45)
        right.setVelocity(-MAX_SPEED * 0.45)
        turn_steps -= 1
        continue

    if obstacle_close:
        print(f'[CleanBot 3D] Obstáculo detectado. Sensor={value:.1f}')
        turn_steps = 28
        left.setVelocity(MAX_SPEED * 0.45)
        right.setVelocity(-MAX_SPEED * 0.45)
    else:
        left.setVelocity(MAX_SPEED)
        right.setVelocity(MAX_SPEED)

    if step_count % 100 == 0:
        print(f'[CleanBot 3D] Navegando. Sensor frontal={value:.1f}')
